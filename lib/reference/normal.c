

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/list.h>
#include <area51/log.h>
#include <libxml/xmlreader.h>
#include <nre/reference.h>

int normaliseText(struct Reference *ref, char *s) {
    int *id = hashmapGet(ref->normtxt, s);
    if (!id) {
        id = malloc(sizeof (int));
        *id = hashmapSize(ref->normtxt) + 1;
        hashmapPut(ref->normtxt, s, id);
        hashmapPut(ref->normid, id, s);
    }
    return *id;
}

char *lookupText(struct Reference *ref, int id) {
    return hashmapGet(ref->normid, &id);
}
