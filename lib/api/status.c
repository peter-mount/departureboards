
#include <pthread.h>
#include <microhttpd.h>
#include <stdint.h>
#include <area51/webserver.h>

#include <stdio.h>
#include <stdlib.h>
#include <area51/charbuffer.h>
#include <area51/json.h>
#include <area51/rest.h>
#include <nre/schedule.h>
#include <string.h>
#include <ctype.h>

#include <area51/hashmap.h>
#include <area51/list.h>
#include <area51/log.h>
#include <area51/stream.h>
#include <microhttpd.h>

/*
 * Handles the /status response which is generated when we index
 */
int tt_api_station_search(WEBSERVER_REQUEST *request) {
    struct Schedules *s = webserver_getUserData(request);

    struct MHD_Response *r = webserver_getResponse(s->webserver, "status");
    return webserver_queueResponse(s->webserver, &r);
}
