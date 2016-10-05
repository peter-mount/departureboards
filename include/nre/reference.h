#ifndef NRE_REFERENCE_H
#define NRE_REFERENCE_H

#include <area51/hashmap.h>
#include <area51/list.h>

#ifdef __cplusplus
extern "C" {
#endif

#define LOCREF_TIPLOC_LEN   7
#define LOCREF_CRS_LEN      3

    struct LocationRef {
        Node node;
        int tiploc;
        int crs;
        int toc;
        int name;
    };

    struct Via {
        int at;
        int dest;
        int loc1;
        int loc2;
        int text;
    };

    struct Reference {
        // Normalisation
        Hashmap *normid;
        Hashmap *normtxt;
        // Locations by tiploc and crs code. List used for searching
        List locations;
        Hashmap *tiploc;
        Hashmap *crs;
        // TOC 2 letter code to full name
        Hashmap *toc;
        // Late reasons
        Hashmap *lateReason;
        // Cancelled reasons
        Hashmap *cancReason;
        // Via, Map of maps keyed by crs and that map list of Via keyed by dest tiploc
        Hashmap *via;
        // CIS Source
        Hashmap *cis;
    };

    extern int normaliseText(struct Reference *, char *);
    extern char *lookupText(struct Reference *, int);

    extern struct Reference *importReference(char *);
#ifdef __cplusplus
}
#endif

#endif /* NRE_REFERENCE_H */

