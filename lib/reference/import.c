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

    loc->tiploc = normaliseText(ref, attr(reader, "tpl"));
    loc->crs = normaliseText(ref, attr(reader, "crs"));
    loc->name = normaliseText(ref, attr(reader, "locname"));
    loc->toc = normaliseText(ref, attr(reader, "toc"));

    list_addTail(&ref->locations, &loc->node);

    if (loc->tiploc)
        hashmapPut(ref->tiploc, &loc->tiploc, loc);

    if (loc->crs)
        hashmapAddList(ref->crs, &loc->crs, loc);

}

static void add(struct Reference *ref, Hashmap *m, char *k, char *v, xmlTextReaderPtr reader) {
    int *id = malloc(sizeof (int));
    *id = normaliseText(ref, attr(reader, k));

    int *name = malloc(sizeof (int));
    *name = normaliseText(ref, attr(reader, v));
    hashmapPut(m, id, name);
}

static void addToc(struct Reference *ref, xmlTextReaderPtr reader) {
    add(ref, ref->toc, "toc", "tocname", reader);
}

static void addReason(struct Reference *ref, Hashmap *m, xmlTextReaderPtr reader) {
    add(ref, m, "code", "reasontext", reader);
}

static void addCis(struct Reference *ref, xmlTextReaderPtr reader) {
    add(ref, ref->cis, "code", "name", reader);
}

static void addVia(struct Reference *ref, xmlTextReaderPtr reader) {
    struct Via *v = malloc(sizeof (struct Via));
    memset(v, 0, sizeof (struct Via));

    v->at = normaliseText(ref, attr(reader, "at"));
    v->dest = normaliseText(ref, attr(reader, "dest"));
    v->loc1 = normaliseText(ref, attr(reader, "loc1"));
    v->loc2 = normaliseText(ref, attr(reader, "loc2"));
    v->text = normaliseText(ref, attr(reader, "viatext"));

    Hashmap *m = hashmapGet(ref->via, &v->at);
    if (!m) {
        m = hashmapCreate(10, hashmapIntHash, hashmapIntEquals);
        hashmapPut(ref->via, &v->at, m);
    }

    hashmapAddList(m, &v->dest, v);
}

struct Reference *importReference(char *filename) {
    struct Reference *ref = malloc(sizeof (struct Reference));
    if (!ref) {
        logconsole("Unable to malloc Reference table");
        exit(99);
    }
    memset(ref, 0, sizeof (struct Reference));

    ref->normid = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    ref->normtxt = hashmapCreate(100, hashmapStringHash, hashmapStringEquals);

    list_init(&ref->locations);
    ref->tiploc = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    ref->crs = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    ref->toc = hashmapCreate(10, hashmapIntHash, hashmapIntEquals);
    ref->lateReason = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    ref->cancReason = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    ref->via = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);
    ref->cis = hashmapCreate(100, hashmapIntHash, hashmapIntEquals);

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
                    addReason(ref, inLate ? ref->lateReason : ref->cancReason, reader);

                if (strcmp("Via", name) == 0)
                    addVia(ref, reader);

                if (strcmp("CISSource", name) == 0)
                    addCis(ref, reader);

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