
#include <pthread.h>
#include <time.h>
#include <microhttpd.h>
#include <stdint.h>
#include <area51/webserver.h>

#include <stdio.h>
#include <stdlib.h>
#include <area51/charbuffer.h>
#include <area51/json.h>
#include <area51/rest.h>
#include <nre/schedule.h>
#include <string.h>
#include <ctype.h>

#include <area51/hashmap.h>
#include <area51/list.h>
#include <area51/log.h>
#include <area51/stream.h>
#include <microhttpd.h>

static void append(CharBuffer *b, struct Schedules *s, char *n, int id) {
    charbuffer_add(b, '\"');
    charbuffer_append(b, n);
    charbuffer_append(b, "\":");
    char *v = lookupText(s->ref, id);
    if (v) {
        charbuffer_add(b, '\"');
        charbuffer_append(b, v);
        charbuffer_add(b, '\"');
    } else
        charbuffer_append(b, "null");
}

static void appendLoc(CharBuffer *b, struct Schedules *s, struct LocationRef *loc) {
    if (loc) {
        charbuffer_add(b, '{');

        append(b, s, "tiploc", loc->tiploc);
        charbuffer_add(b, ',');
        append(b, s, "crs", loc->crs);
        charbuffer_add(b, ',');
        append(b, s, "toc", loc->toc);
        charbuffer_add(b, ',');
        append(b, s, "name", loc->name);

        charbuffer_add(b, '}');
    } else
        charbuffer_append(b, "null");
}

static void appendTime(CharBuffer *b, char *n, int t, bool sec) {
    if (t > 0) {
        charbuffer_append(b, ",\"");
        charbuffer_append(b, n);
        charbuffer_append(b, "\":\"");
        charbuffer_append_int(b, (t / 3600), 2);
        charbuffer_add(b, ':');
        charbuffer_append_int(b, (t / 60) % 60, 2);
        if (sec) {
            charbuffer_add(b, ':');
            charbuffer_append_int(b, t % 60, 2);
        }
        charbuffer_add(b, '"');
    }
}

static void appendSchedLoc(CharBuffer *b, struct Schedules *s, struct SchedLoc *loc) {
    if (loc) {
        charbuffer_add(b, '{');

        struct LocationRef *lr = hashmapGet(s->ref->tiploc, &loc->tpl);
        charbuffer_append(b, "\"tpl\":");
        appendLoc(b, s, lr);

        charbuffer_add(b, ',');
        append(b, s, "act", loc->act);
        charbuffer_add(b, ',');
        append(b, s, "plat", loc->plat);

        appendTime(b, "pta", loc->pta, false);
        appendTime(b, "ptd", loc->ptd, false);
        appendTime(b, "wta", loc->wta, true);
        appendTime(b, "wtd", loc->wtd, true);
        appendTime(b, "wtp", loc->wtp, true);

        charbuffer_add(b, '}');
    } else
        charbuffer_append(b, "null");
}

static void appendSched(CharBuffer *b, struct Schedules *s, struct Schedule *sched, struct SchedLoc *station) {
    charbuffer_add(b, '{');
    append(b, s, "rid", sched->rid);
    charbuffer_add(b, ',');
    append(b, s, "uid", sched->uid);
    charbuffer_add(b, ',');
    append(b, s, "trainid", sched->trainId);
    charbuffer_add(b, ',');
    append(b, s, "ssd", sched->ssd);
    charbuffer_add(b, ',');
    append(b, s, "toc", sched->toc);

    charbuffer_append(b, ",\"loc\":");
    appendSchedLoc(b, s, station);

    charbuffer_append(b, ",\"origin\":");
    appendSchedLoc(b, s, (struct SchedLoc *) list_getHead(&sched->locations));

    charbuffer_append(b, ",\"dest\":");
    appendSchedLoc(b, s, (struct SchedLoc *) list_getTail(&sched->locations));
    charbuffer_add(b, '}');
}

static struct SchedLoc *findLoc(struct Schedules *s, struct Schedule *sched, int crs) {
    Node *n = list_getHead(&sched->locations);
    while (list_isNode(n)) {
        struct SchedLoc *loc = (struct SchedLoc *) n;
        struct LocationRef *lr = hashmapGet(s->ref->tiploc, &loc->tpl);
        if (lr && lr->crs == crs)
            return loc;
        n = list_getNext(n);
    }
    return NULL;
}

/*
 * Display the current departure board for a station
 */
int api_board(WEBSERVER_REQUEST *request) {
    struct Schedules *s = webserver_getUserData(request);

    const char *url = webserver_getRequestUrl(request);

    char *crs = (char *) &url[12];

    // Return not found
    if (strlen(crs) != 3)
        return 0;

    // Now force upper case & allow only letters
    crs = strdup(crs);
    if (!crs)
        return 0;

    for (int i = 0; i < 3; i++) {
        if (!isalpha(crs[i])) {
            free(crs);
            return 0;
        }
        crs[i] = toupper(crs[i]);
    }

    // Now lookup the crsId
    int crsId = lookupId(s->ref, crs);
    if (crsId == 0)
        return 0;

    CharBuffer *b = charbuffer_new();

    // Resolve station name - use first name!=tiploc
    charbuffer_append(b, "{\"station\":");
    struct LocationRef *stn = NULL;
    List *l = hashmapGet(s->ref->crs, &crsId);
    Node *n = list_getHead(l);
    while (list_isNode(n)) {
        struct LocationRef *loc = n->value;
        if (loc->name != loc->tiploc)
            stn = loc;
        n = list_getNext(n);
    }
    appendLoc(b, s, stn);

    charbuffer_append(b, ",\"departures\":[");

    struct tm tm;
    time_t now;
    time(&now);
    localtime_r(&now, &tm);

    // The time window
    int start = (tm.tm_hour * 3600)+(tm.tm_min * 60) + tm.tm_sec;
    int end = start + 3600;

    // Get the departures
    schedules_lock(s);
    l = hashmapGet(s->crs, &crsId);
    if (l) {
        bool first = true;
        n = list_getHead(l);
        while (list_isNode(n)) {
            struct Schedule *sched = n->value;
            n = list_getNext(n);

            struct SchedLoc *sl = findLoc(s, sched, crsId);
            if (sl) {
                int t = sl->ptd;
                if (t < 1) t = sl->pta;
                if (t < 1) t = sl->wtd;
                if (t < 1) t = sl->wta;
                if (t < 1) t = sl->wtp;
                if (t >= start && t <= end) {
                    if (first)
                        first = false;
                    else
                        charbuffer_add(b, ',');
                    appendSched(b, s, sched, sl);
                }
            }
        }
    }
    schedules_unlock(s);

    charbuffer_append(b, "]}");

    int len;
    void *data = charbuffer_toarray(b, &len);

    charbuffer_free(b);

    struct MHD_Response *response = MHD_create_response_from_buffer(len, data, MHD_RESPMEM_MUST_FREE);

    return webserver_queueResponse(request, &response);
}
