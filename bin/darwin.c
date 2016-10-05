
/* 
 * File:   corpus-import.c
 * Author: peter
 *
 * Created on 17 July 2016, 21:20
 */

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <area51/hashmap.h>
#include <area51/log.h>
#include <area51/list.h>
#include <nre/reference.h>
#include <nre/schedule.h>

int verbose = 0;

static int about(char *n) {
    logconsole("Usage: %s reference.xml timetable.xml", n);
    return 1;
}

/**
 * Import the reference data
 * @param argv argv[1] reference argv[2] timetable
 * @return Schedules loaded
 */
static struct Schedules *importAll(char **argv) {
    struct Reference *ref = importReference(argv[1]);

    logconsole("Tiplocs %d CRS %d Locations %d TOC's %d",
            hashmapSize(ref->tiploc),
            hashmapSize(ref->crs),
            list_size(&ref->locations),
            hashmapSize(ref->toc)
            );

    logconsole("Reasons: Late %d Cancelled %d",
            hashmapSize(ref->lateReason),
            hashmapSize(ref->cancReason)
            );

    struct Schedules *schedules = importSchedules(ref, argv[2]);
    indexSchedules(schedules);
    logconsole("Schedules: %d crs %d",
            hashmapSize(schedules->schedules),
            hashmapSize(schedules->crs)
            );

    logconsole("Normalization: %d %d", hashmapSize(ref->normid), hashmapSize(ref->normtxt));
    return schedules;
}

static void initWebserver(struct Schedules *schedules) {
    schedules->webserver = webserver_new();
    webserver_enableIPv4(schedules->webserver);
    webserver_enableIPv6(schedules->webserver);
    webserver_setPort(schedules->webserver, 8080);
    webserver_set_defaults(schedules->webserver);
}

static void registerAPIs(struct Schedules *s) {

    // /status is updated every 60 seconds
    area51_mainRunPeriodic(s->tasks, updateStatus, 60, s, NULL);
    webserver_add_response_handler(s->webserver, "/status");
}

int main(int argc, char** argv) {
    if (argc < 3) {
        return about(argv[0]);
    }

    struct Schedules *schedules = importAll(argv);

    schedules->tasks = area51_mainInit();

    initWebserver(schedules);
    registerAPIs(schedules);

    // Now start the microservice
    schedules->running = true;

    logconsole("Starting webserver");
    webserver_start(schedules->webserver);

    logconsole("%s now running", argv[0]);
    area51_mainLoop(schedules->tasks);

    return EXIT_SUCCESS;
}

