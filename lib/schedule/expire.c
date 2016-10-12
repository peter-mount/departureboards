
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/hashmap.h>
#include <area51/list.h>
#include <area51/log.h>
#include <nre/reference.h>
#include <nre/schedule.h>

struct ctx {
    struct Schedules *s;
    int cutoff;
    List remove;
    time_t tomorrow;
};

static bool scan(void *k, void *v, void *c) {
    struct ctx *ctx = c;
    struct Schedule *s = v;

    struct SchedLoc *sl = (struct SchedLoc *) list_getTail(&s->locations);
    if (sl) {
        int t = sl->ptd;
        if (t < 1) t = sl->pta;
        if (t < 1) t = sl->wtd;
        if (t < 1) t = sl->wta;
        if (t < 1) t = sl->wtp;
        
        // keep if before 2am or after the cutoff
        if (t < 7200 )
            return true;
        
        struct tm tm;
        gmtime_r(&s->ssd,&tm);
        tm.tm_hour=t/3600;
        tm.tm_min=(t/60)%60;
        tm.tm_sec=t%60;
        time_t t1 = mktime(&tm);
        
        // keep if after the cutoff but not tomorrow
        if (t1<ctx->tomorrow && t >= ctx->cutoff)
            return true;
    }

    Node *n = node_alloc((char *) s);
    list_addTail(&ctx->remove, n);

    return true;
}

/**
 * Expire any schedules who are in the past (by at least an hour so we don't remove a delayed running service)
 * 
 * Note: This is only run on startup to free up memory.
 * 
 * @param s
 */
void expireSchedules(struct Schedules *s) {
    logconsole("Expiring %d schedules", hashmapSize(s->schedules));

    struct tm tm;
    time_t now;
    time(&now);
    gmtime_r(&now, &tm);

    // Too early then do nothing
    if (tm.tm_hour < 2)
        return;

    struct ctx ctx;
    ctx.s = s;
    ctx.cutoff = ((tm.tm_hour - 1)*3600) + (tm.tm_min * 60) + tm.tm_sec;
    ctx.tomorrow = now+86400;
    list_init(&ctx.remove);

    hashmapForEach(s->schedules, scan, &ctx);

    logconsole("Removing %d schedules", list_size(&ctx.remove));

    Node *n = list_getHead(&ctx.remove);
    while (list_isNode(n)) {
        struct Schedule *sched = n->value;
        Node *next = list_getNext(n);
        n->value = NULL;
        list_remove(n);
        node_free(n);

        n = next;

        schedule_free(s, sched);
    }
}