/* http://DepartureBoards.mobi (C) 2016 Peter Mount */
var UI = (function () {
    function UI() {

    }
    UI.urlChange = function (l) {
        // Comment out when running within NetBeans
        if (window.location.hostname !== 'localhost')
            history.pushState(history.state, null, l);
    };

    var panes = ['#searchPane', '#boardPane'];
    UI.show = function (id) {
        $.each(panes, function (i, p) {
            var f = p === id;
            $(p).addClass(f ? "paneVisible" : "paneInvisible")
                    .removeClass(f ? "paneInvisible" : "paneVisible");
        });
    };

    UI.showAbout = function () {
        $("#about").modal();
    };

    UI.showContact = function () {
        $("#contactus").modal();
    };

    // ==== Station search ====
    // Last received station results
    var stationResults = {};
    // Show the station page
    UI.showSearch = function () {
        UI.urlChange('/');
        UI.show("#searchPane");
        setTimeout(function () {
            $('#stations').focus();
        }, 250);
    };

    // Parse received json into stationResults & typeahead
    UI.stationSearch = function (parsedResponse) {
        stationResults = parsedResponse.reduce(function (a, b) {
            a[b.label] = b;
            return a;
        }, {});
        return parsedResponse.reduce(function (a, b) {
            a.push(b.label);
            return a;
        }, []);
    };

    // Select station
    UI.stationSearchOn = function (e) {
        var t = $('#stations').val();
        var loc = stationResults[t];
        $('#stations').typeahead('setQuery', '');
        if (loc)
            UI.showCRS(loc.code);
    };

    // ===== Station page =====
    var stationCrs;
    UI.showCRS = function (crs) {
        stationCrs = crs.toUpperCase();
        UI.urlChange('/' + stationCrs);
        // Clear any existing data nbsp to stop annoying pull up of headers
        $('#boardName').empty().append('&nbsp;');
        $('#boardTable').empty();
        // Show the boards and refresh
        UI.show("#boardPane");
        UI.refreshBoard();
    };
    UI.refreshBoard = function () {
        if (!stationCrs)
            UI.showSearch();
        else {
            var url = "//api.area51.onl/rail/1/station/" + stationCrs + "/boards";
            console.log("refresh: " + stationCrs + " = " + url);
            $.ajax({
                url: url,
                dataType: 'json',
                cache: false,
                success: showCrsBoard
            });
        }
    };

    var a = function () {
        return $('<a></a>');
    };
    var div = function () {
        return $('<div></div>');
    };
    var span = function () {
        return $('<span></span>');
    };
    var parseTime = function (d, t) {
        return Date.parse(d + "T" + t);
    };
    var parseLocTime = function (a) {
        return parseTime(a.ssd, a.loc.ptd ? a.loc.ptd : a.loc.pta ? a.loc.pta : a.loc.wtd ? a.loc.wtd : a.loc.wta);
    };
    // glyphicons 
    var icons ={
        ALERT:'glyphicon-alert',
        INFO:'glyphicon-info-sign',
        WARNING:'glyphicon-warning-sign',
        NOTICE:'glyphicon-exclamation-sign',
        QUESTION:'glyphicon-info-sign',
        OK:'glyphicon-ok-sign',
        GLOBAL:'glyphicon-globe',
        HEART:'glyphicon-heart-empty',
        PHONE:'glyphicon-earphone',
        FOOD:'glyphicon-cutlery',
        PLUS:'glyphicon-plus-sign',
        MINUS:'glyphicon-minus-sign'
    };
    var showCrsBoard = function (data) {
        console.log(JSON.stringify(data));
        $('#boardName').empty().append(data.station.name);
        var tab = $('#boardTable');
        tab.empty();

        if (!data.departures || data.departures.length === 0) {
            // Show no data
            div().appendTo(tab).append("No data available");
        } else {
            var altrow = 0;

            if (data.messages)
                data.messages.forEach(function (m) {
                    var row = div().appendTo(tab);
                    altrow = 1 - altrow;
                    if (altrow)
                        row.addClass("altrow");

                    d = div().addClass("ldb-enttop").appendTo(row)
                    .append('<div class="glyphicon '+(m.icon&&icons[m.icon]?icons[m.icon]:icons.INFO)+'" aria-hidden="true" style="float:left;font-size: 200%;font-weight:normal;margin: 0.2em;"></div>')
                    .append(m.message);
                    d = div().addClass("ldb-entbot").appendTo(row).append('&nbsp;');
                });

            // sort
            //data.departures.sort(function (a, b) {                return parseLocTime(a) - parseLocTime(b);            });

            // Don't show too far in the future (we could see tomorrows data in here)
            var now = Date.now() + 86400000 - 3600000;
            data.departures.forEach(function (v) {
                // Don't go too far ahead
                //if (parseLocTime(v) >= now)                    return;

                // Optional hide terminating trains
                //if (v.status.terminatesHere)                    return;

                var row = div().appendTo(tab);
                altrow = 1 - altrow;
                if (altrow)
                    row.addClass("altrow");

                var d = div().addClass("ldb-enttop").appendTo(row);
                var fd = div().appendTo(d).addClass("ldbCol").addClass("ldbForecast");
                if (v.status.cancelled)
                    fd.append('Cancelled');
                else if (v.status.arrived)
                    fd.append('Arrived');
                else if (v.status.delayed)
                    fd.append('Delayed');
                else if (v.status.time === v.forecast.ptd || v.status.time === v.forecast.pta)
                    fd.append('On&nbsp;Time');
                else
                    fd.append(v.status.time);

                // make easier
                d.append(div().addClass("ldbCol").addClass("ldbSched").append(v.forecast.ptd ? v.forecast.ptd : v.forecast.pta))
                        .append(div().addClass("ldbCol").addClass("ldbPlat").append(v.status.platform));
                var cont = div().addClass("ldbCont").appendTo(d)
                        .append(a().append(v.status.terminatesHere ? "Terminates here" : v.train.dest));
                if (v.status.via)
                    cont.append(span().addClass("ldbVia").append(" via " + v.status.via));

                if (v.status.reason)
                    div().appendTo(row).addClass("ldbCont").append(v.status.reason);

                if (!v.status.terminatesHere && !v.status.cancelled && v.calling && v.calling.length > 0) {
                    d = div().addClass("ldb-entbot").appendTo(row).append("Calling at:");
                    v.calling.forEach(function (cp) {
                        d.append(span().addClass("callList").append(" ")
                                .append(a().append(a().append(cp.name).click(function (e) {
                                    UI.showCRS(cp.crs);
                                })))
                                .append("&nbsp;(").append(cp.time).append(")"));
                    });
                }

                // Operator and last report lines
                d = div().addClass("ldb-entbot").appendTo(row);
                // todo add full name to toc
                if (v.train.toc)
                    span().appendTo(d).append(v.train.toc).append("&nbsp;service. ");

                if (v.status.length)
                    d.append(span().addClass("ldbHeader").append(" Formed&nbsp;of&nbsp;"))
                            .append(v.status.length)
                            .append(span().addClass("ldbDest").append("coaches"));

                if (v.status.delay)
                    d.append(span().addClass("ldbHeader").append("Delayed&nbsp;by&nbsp;"))
                            .append(v.status.delay)
                            .append(span().addClass("ldbHeader").append(Math.abs(v.status.delay) == 1 ? " minute" : " minutes"));

                d = div().addClass("ldb-entbot").appendTo(row);
                if (v.status.lastReport)
                    d.append("Last report: ")
                            .append(span().addClass("ldbDest").append(v.status.lastReport.name))
                            .append("&nbsp;(").append(v.status.lastReport.time).append(') ');

            });

            // FIXME adds padding to bottom of page, scrolling hides otherwise with the footer
            div().appendTo(tab).append('&nbsp;');
        }
    };

    return UI;
})();

$(document).ready(function () {
    // Collapse the nav bar on small devices when option selected
    $(document).on('click', '.navbar-collapse.in', function (e) {
        $(this).collapse('hide');
    });

    // Station search component
    $('#stations').typeahead({
        limit: 10,
        name: "search",
        remote: {
            url: '//api.area51.onl/rail/1/search?q=%QUERY',
            dataType: 'json',
            cache: true,
            filter: UI.stationSearch
        }
    }).on("typeahead:selected", UI.stationSearchOn);

    // Get the page url, remove any / or /index.html
    var l = location.pathname;
    while (l.endsWith("/index.html"))
        l = l.substr(0, l.length - "/index.html".length);
    while (l.endsWith("/"))
        l = l.substr(0, l.length - 1);

    // Show station page based on crs code in url, otherwise the search page
    // /mldb/ is to support old url's from the old app
//    if (1)
//        UI.showCRS('LBG');
//    else
    if (l.match("/mldb/[a-zA-Z]{3}"))
        UI.showCRS(l.substr(6));
    else if (l.match("/[a-zA-Z]{3}"))
        UI.showCRS(l.substr(1));
    else
        UI.showSearch();
});
