/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <area51/list.h>
#include <area51/log.h>
#include <libxml/xmlreader.h>
#include <nre/reference.h>

static char *attr(xmlTextReaderPtr reader, char *n) {
    const xmlChar *v = xmlTextReaderGetAttribute(reader, n);
    return v ? strdup(v) : NULL;
}

static void attrC(xmlTextReaderPtr reader, char *n, char *d, int l) {
    const xmlChar *v = xmlTextReaderGetAttribute(reader, n);
    if (v)
        strncpy(d, v, l);
    else
        *d = 0;
}

static void addLocation(struct Reference *ref, xmlTextReaderPtr reader) {
    struct LocationRef *loc = malloc(sizeof (struct LocationRef));
    if (!loc)
        return;

    memset(loc, 0, sizeof (struct LocationRef));

    attrC(reader, "tpl", loc->tiploc, LOCREF_TIPLOC_LEN);
    attrC(reader, "crs", loc->crs, LOCREF_CRS_LEN);

    loc->node.name = attr(reader, "locname");

    attrC(reader, "toc", loc->toc, 2);

    list_addTail(&ref->locations, &loc->node);

    if (loc->tiploc[0])
        hashmapPut(ref->tiploc, loc->tiploc, loc);

    if (loc->crs[0])
        hashmapAddList(ref->crs, loc->crs, loc);

}

static void addToc(struct Reference *ref, xmlTextReaderPtr reader) {
    char *k = attr(reader, "toc");
    char *v = attr(reader, "tocname");
    if (k && v)
        hashmapPut(ref->toc, k, v);
}

static void addReason(Hashmap *m, xmlTextReaderPtr reader) {
    char *k = attr(reader, "code");
    char *v = attr(reader, "reasontext");
    if (k && v)
        hashmapPut(m, k, v);
}

static void addVia(struct Reference *ref, xmlTextReaderPtr reader) {
    struct Via *v = malloc(sizeof (struct Via));
    memset(v, 0, sizeof (struct Via));

    attrC(reader, "at", v->at, LOCREF_CRS_LEN);
    attrC(reader, "dest", v->dest, LOCREF_TIPLOC_LEN);
    attrC(reader, "loc1", v->loc1, LOCREF_TIPLOC_LEN);
    attrC(reader, "loc2", v->loc2, LOCREF_TIPLOC_LEN);
    // We could optimise text as it's duplicated a lot
    v->text = attr(reader, "viatext");

    Hashmap *m = hashmapGet(ref->via, v->at);
    if (!m) {
        m = hashmapCreate(10, hashmapStringHash, hashmapStringEquals);
        hashmapPut(ref->via, v->at, m);
    }

    hashmapAddList(m,v->dest,v);
}

struct Reference *importReference(char *filename) {
    struct Reference *ref = malloc(sizeof (struct Reference));
    if (!ref) {
        logconsole("Unable to malloc Reference table");
        exit(99);
    }
    memset(ref, 0, sizeof (struct Reference));
    list_init(&ref->locations);
    ref->tiploc = hashmapCreate(100, hashmapStringHash, hashmapStringEquals);
    ref->crs = hashmapCreate(100, hashmapStringHash, hashmapStringEquals);
    ref->toc = hashmapCreate(10, hashmapStringHash, hashmapStringEquals);
    ref->lateReason = hashmapCreate(100, hashmapStringHash, hashmapStringEquals);
    ref->cancReason = hashmapCreate(100, hashmapStringHash, hashmapStringEquals);
    ref->via = hashmapCreate(100, hashmapStringHash, hashmapStringEquals);

    logconsole("Importing reference file %s", filename);

    bool inLate = false;

    xmlTextReaderPtr reader = xmlReaderForFile(filename, NULL, 0);
    if (reader != NULL) {
        int ret = xmlTextReaderRead(reader);
        while (ret == 1) {
            const xmlChar *name = xmlTextReaderConstName(reader);
            if (name != NULL) {

                if (strcmp("LocationRef", name) == 0)
                    addLocation(ref, reader);

                if (strcmp("TocRef", name) == 0)
                    addToc(ref, reader);

                if (strcmp("LateRunningReasons", name) == 0)
                    inLate = true;

                if (strcmp("CancellationReasons", name) == 0)
                    inLate = false;

                if (strcmp("Reason", name) == 0)
                    addReason(inLate ? ref->lateReason : ref->cancReason, reader);

                if (strcmp("Via", name) == 0)
                    addVia(ref, reader);

            }
            ret = xmlTextReaderRead(reader);
        }
        xmlFreeTextReader(reader);

        if (ret == 0)
            return ref;

        logconsole("%s : failed to parse\n", filename);
        return ref;
    } else
        logconsole("Unable to open %s\n", filename);

    exit(1);
}