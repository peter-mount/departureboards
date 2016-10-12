

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/list.h>
#include <area51/log.h>
#include <libxml/xmlreader.h>
#include <nre/reference.h>

/**
 * Normalise a string. If the string is not known a suplicate is added to the table.
 * If it is known, the existing id is returned.
 * @param ref
 * @param s String
 * @return unique id
 */
int normaliseText(struct Reference *ref, char *s) {
    if (!s)
        return 0;

    int *id = hashmapGet(ref->normtxt, s);
    if (!id) {
        char *ns = strdup(s);
        id = malloc(sizeof (int));
        *id = hashmapSize(ref->normtxt) + 1;
        hashmapPut(ref->normtxt, ns, id);
        hashmapPut(ref->normid, id, ns);
    }
    return *id;
}

char *lookupText(struct Reference *ref, int id) {
    return id < 1 ? NULL : hashmapGet(ref->normid, &id);
}

/**
 * Same as normaliseText but does not create if not found
 * @param ref
 * @param s
 * @return 
 */
int lookupId(struct Reference *ref, char *s) {
    if (!s)
        return 0;

    int *id = hashmapGet(ref->normtxt, s);
    return id ? *id : 0;
}
