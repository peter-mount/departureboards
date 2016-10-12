#include <microhttpd.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdarg.h>
#include <area51/log.h>
#include <area51/webserver.h>
#include "nre/schedule.h"

int schedules_lock(struct Schedules *s) {
    return pthread_mutex_lock(&s->mutex);
}

void schedules_unlock(struct Schedules *s) {
    pthread_mutex_unlock(&s->mutex);
}

/**
 * Used from inside a lock, increment the use count
 * @param s
 */
void schedule_inc(struct Schedule *s) {
    s->useCount++;
}
