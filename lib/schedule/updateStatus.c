
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/charbuffer.h>
#include <area51/hashmap.h>
#include <area51/list.h>
#include <area51/log.h>
#include <area51/main.h>
#include <nre/reference.h>
#include <nre/schedule.h>

void updateStatusImpl(struct Schedules *s) {
    logconsole("Updating status");

    CharBuffer *b = charbuffer_new();
    charbuffer_add(b, '{');

    schedules_lock(s);

    charbuffer_append(b, "\"reference\":{\"tiploc\":");
    charbuffer_append_int(b, hashmapSize(s->ref->tiploc), 0);

    charbuffer_append(b, ",\"crs\":");
    charbuffer_append_int(b, hashmapSize(s->ref->crs), 0);

    charbuffer_append(b, ",\"toc\":");
    charbuffer_append_int(b, hashmapSize(s->ref->toc), 0);

    charbuffer_append(b, ",\"lateReason\":");
    charbuffer_append_int(b, hashmapSize(s->ref->lateReason), 0);

    charbuffer_append(b, ",\"cancReason\":");
    charbuffer_append_int(b, hashmapSize(s->ref->cancReason), 0);

    charbuffer_append(b, "},\"schedules\":{\"schedules\":");
    charbuffer_append_int(b, hashmapSize(s->schedules), 0);

    charbuffer_append(b, ",\"crs\":");
    charbuffer_append_int(b, hashmapSize(s->crs), 0);

    charbuffer_add(b, '}');

    schedules_unlock(s);

    charbuffer_add(b, '}');

    webserver_replaceResponseCharBuffer(s->webserver, "/status", b, "application/json");

    charbuffer_free(b);

}

void updateStatus(MainTask *t) {
    struct Schedules *s = area51_mainGetUserData(t);
    updateStatusImpl(s);
}
