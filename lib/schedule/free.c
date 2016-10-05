#include <microhttpd.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdarg.h>
#include <area51/log.h>
#include <area51/list.h>
#include <area51/webserver.h>
#include "nre/schedule.h"

static void removeFromStation(List *l, struct Schedule *sched) {
    Node *n = list_getHead(l);
    while (list_isNode(n)) {
        Node *e = n;
        n = list_getNext(n);
        if (e->value == sched) {
            list_remove(e);
            free(e);
        }
    }
}

static void freeSched(struct Schedules *s, struct Schedule *sched) {
    // Don't log on startup
    if (s->running)
        logconsole("Removing schedule %s", lookupText(s->ref, sched->rid));

    // Scan stations in the schedule and remove the schedule from them
    Node *n = list_getHead(&sched->locations);
    while (list_isNode(n)) {
        struct SchedLoc *sl = (struct SchedLoc *) n;
        n = list_getNext(n);

        struct LocationRef *l = hashmapGet(s->ref->tiploc, &sl->tpl);
        if (l && l->crs > 0) {
            // Remove the entry from the station
            List *list = hashmapGet(s->crs, &l->crs);
            if (list)
                removeFromStation(list, sched);
        }

        // Now we are done, free the location
        list_remove(&sl->node);
        free(sl);
    }

    // Now free the schedule
    free(sched);
}

/**
 * Used from outside a lock, release a schedule. If the count reaches 0 it's removed and freed
 * @param s
 */
void schedule_free(struct Schedules *s, struct Schedule *sched) {
    if (s) {
        schedules_lock(s);

        if (sched->useCount)
            sched->useCount--;

        if (sched->useCount == 0)
            freeSched(s, sched);

        schedules_unlock(s);
    }
}