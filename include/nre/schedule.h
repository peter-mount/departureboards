#ifndef NRE_SCHEDULE_H
#define NRE_SCHEDULE_H

#include <time.h>
#include <area51/list.h>
#include <nre/reference.h>

#ifdef __cplusplus
extern "C" {
#endif

#define LOC_ORIGIN      0x01
#define LOC_PASS        0x02
#define LOC_STOP        0x04
#define LOC_DEST        0x08
#define LOC_OPERATIONAL 0x10
#define LOC_OPOR    (LOC_OPERATIONAL|LOC_ORIGIN)
#define LOC_OR      LOC_ORIGIN
#define LOC_IP      LOC_STOP
#define LOC_PP      LOC_PASS
#define LOC_OPIP    (LOC_OPERATIONAL|LOC_STOP)
#define LOC_DT      LOC_DEST
#define LOC_OPDT    (LOC_OPERATIONAL|LOC_DEST)
    
    struct SchedLoc {
        Node node;
        // Timetable
        char type;
        int tpl;
        int act;
        int plat;
        int pta;
        int ptd;
        int wta;
        int wtd;
        int wtp;
        // Forecast
    };

    struct Schedule {
        int rid;
        int uid;
        int trainId;
        time_t ssd;
        int toc;
        List locations;
    };

    struct Schedules {
        struct Reference *ref;
        // Schedule indexed by rid
        Hashmap *schedules;
        // List of schedules per CRS
        Hashmap *crs;
    };

    extern struct Schedules *importSchedules(struct Reference *, char *);
    extern void indexSchedules(struct Schedules *);
    
#ifdef __cplusplus
}
#endif

#endif /* NRE_SCHEDULE_H */

