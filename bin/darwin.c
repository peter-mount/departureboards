
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

int verbose = 0;

static int about(char *n) {
    logconsole("Usage: %s reference.xml", n);
    return 1;
}

int main(int argc, char** argv) {
    if (argc < 2) {
        return about(argv[0]);
    }

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

    logconsole("Normalization: %d %d",
            hashmapSize(ref->normid),
            hashmapSize(ref->normtxt)
            );
    return EXIT_SUCCESS;
}

