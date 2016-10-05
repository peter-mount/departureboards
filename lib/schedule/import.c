
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/hashmap.h>
#include <area51/list.h>
#include <area51/log.h>
#include <libxml/xmlreader.h>
#include <nre/reference.h>
#include <nre/schedule.h>

static int attr(struct Schedules *s, xmlTextReaderPtr reader, char *n) {
    const xmlChar *v = xmlTextReaderGetAttribute(reader, n);
    return v ? normaliseText(s->ref, (char *) v) : 0;
}

static int tim(xmlTextReaderPtr reader, char *n) {
    const xmlChar *v = xmlTextReaderGetAttribute(reader, n);
    if (!v)
        return -1;

    int t = ((v[0] - '0')*10)+(v[1] - '0');
    t *= 60;

    t += ((v[3] - '0')*10)+(v[4] - '0');
    t *= 60;

    if (v[5] == ':')
        t += ((v[6] - '0')*10)+(v[7] - '0');

    return t;
}

static struct Schedule *addJourney(struct Schedules *s, xmlTextReaderPtr reader) {
    struct Schedule *sched = malloc(sizeof (struct Schedule));
    if (!sched)
        return NULL;

    memset(sched, 0, sizeof (struct Schedule));

    sched->rid = attr(s, reader, "rid");
    sched->uid = attr(s, reader, "uid");
    sched->trainId = attr(s, reader, "trainId");
    sched->ssd = attr(s, reader, "ssd");
    sched->toc = attr(s, reader, "toc");

    list_init(&sched->locations);

    // Initial use as we are in the schedules
    sched->useCount = 1;

    void *e = hashmapPut(s->schedules, &sched->rid, sched);
    if (e) {
        logconsole("Fail rid %d e %lx s %lx %lx", sched->rid, e, sched, &sched->rid);
        struct Schedule *es = (struct Schedule *) e;
        logconsole("rid %s", lookupText(s->ref, sched->rid));
        logconsole("rid %s", lookupText(s->ref, es->rid));

        exit(30);
    }

    return sched;
}

static void addLoc(struct Schedule *sched, struct Schedules *s, xmlTextReaderPtr reader, int type) {

    struct SchedLoc *l = malloc(sizeof (struct SchedLoc));
    if (!l)
        return;

    memset(l, 0, sizeof (struct SchedLoc));

    l->type = type;
    l->tpl = attr(s, reader, "tpl");
    l->act = attr(s, reader, "act");
    l->plat = attr(s, reader, "plat");
    l->pta = tim(reader, "pta");
    l->ptd = tim(reader, "ptd");
    l->wta = tim(reader, "wta");
    l->wtd = tim(reader, "wtd");
    l->wtp = tim(reader, "wtp");
    list_addTail(&sched->locations, &l->node);
}

struct Schedules *importSchedules(struct Reference *ref, char *filename) {
    struct Schedules *s = malloc(sizeof (struct Schedules));
    if (!s) {
        logconsole("Unable to malloc schedules");
        exit(99);
    }

    memset(s, 0, sizeof (struct Schedules));
    pthread_mutex_init(&s->mutex, NULL);
    s->ref = ref;
    s->schedules = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    s->crs = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);

    logconsole("Importing timetable file %s", filename);

    struct Schedule *sched = NULL;

    xmlTextReaderPtr reader = xmlReaderForFile(filename, NULL, 0);
    if (reader != NULL) {
        int ret = xmlTextReaderRead(reader);
        while (ret == 1) {
            const xmlChar *name = xmlTextReaderConstName(reader);
            if (name != NULL) {

                if (strcmp("Journey", name) == 0)
                    if (sched)
                        sched = NULL;
                    else
                        sched = addJourney(s, reader);
                else
                    if (strcmp("OR", name) == 0)
                    addLoc(sched, s, reader, LOC_OR);
                else
                    if (strcmp("IP", name) == 0)
                    addLoc(sched, s, reader, LOC_IP);
                else
                    if (strcmp("PP", name) == 0)
                    addLoc(sched, s, reader, LOC_PP);
                else
                    if (strcmp("DT", name) == 0)
                    addLoc(sched, s, reader, LOC_DT);
                else
                    if (strcmp("OPOR", name) == 0)
                    addLoc(sched, s, reader, LOC_OPOR);
                else
                    if (strcmp("OPIP", name) == 0)
                    addLoc(sched, s, reader, LOC_OPIP);
                else
                    if (strcmp("OPDT", name) == 0)
                    addLoc(sched, s, reader, LOC_OPDT);

            }
            ret = xmlTextReaderRead(reader);
        }
        xmlFreeTextReader(reader);

        if (ret == 0)
            return s;

        logconsole("%s : failed to parse\n", filename);
    } else
        logconsole("Unable to open %s\n", filename);

    exit(1);
}