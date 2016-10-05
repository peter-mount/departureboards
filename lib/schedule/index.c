
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/hashmap.h>
#include <area51/list.h>
#include <area51/log.h>
#include <nre/reference.h>
#include <nre/schedule.h>

/*
 * Callback to add a schedule to the crs locations map
 */
static bool indexAll(void *k, void *v, void *c) {
    int *ridId = k;
    struct Schedule *sched = v;
    struct Schedules *s = c;

    Node *n = list_getHead(&sched->locations);
    while (list_isNode(n)) {
        struct SchedLoc *sl = (struct SchedLoc *) n;
        n = list_getNext(n);

        struct LocationRef *l = hashmapGet(s->ref->tiploc, &sl->tpl);
        if (l && l->crs > 0)
            hashmapAddList(s->crs, &l->crs, sched);
    }
    
    return true;
}

/**
 * Index all schedules adding them to the crs hashmap so we have a list of entries for each station
 * @param s
 */
void indexSchedules(struct Schedules *s) {
    logconsole("Indexing %d schedules", hashmapSize(s->schedules));

    // Run through each crs
    hashmapForEach(s->schedules, indexAll, s);
}
