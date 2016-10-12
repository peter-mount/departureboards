/* http://DepartureBoards.mobi (C) 2016 Peter Mount */
var UI = (function () {
    function UI() {

    }
    UI.urlChange = function (l) {
        // Comment out when running within NetBeans
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
        var t = $('#stations').val().toUpperCase();
        parsedResponse.sort(t.length === 3 ? function (a, b) {
            return a.crs === t ? -2 : b.crs === t ? 2 : a.name < b.name ? -1 : 1;
        } : function (a, b) {
            return a.name < b.name ? -1 : 1;
        });
        stationResults = {};
        var ary = [];
        $.each(parsedResponse, function (i, loc) {
            if (loc.tiploc !== loc.name) {
                loc.text = loc.name + " [" + loc.crs + "]";
                stationResults[loc.text] = loc;
                ary.push(loc.text);
            }
        });
        console.log(stationResults);
        return ary;
    };

    // Select station
    UI.stationSearchOn = function (e) {
        var t = $('#stations').val();
        var loc = stationResults[t];
        $('#stations').typeahead('setQuery', '');
        if (loc && loc.crs && loc.crs !== '')
            UI.showCRS(loc.crs);
    };

    // ===== Station page =====
    var stationCrs;
    UI.showCRS = function (crs) {
        stationCrs = crs.toUpperCase();
        UI.urlChange('/' + stationCrs);
        // Clear any existing data
        $('#boardName').empty();
        $('#boardTable').empty();
        // Show the boards and refresh
        UI.show("#boardPane");
        UI.refreshBoard();
    };
    UI.refreshBoard = function () {
        if (!stationCrs)
            UI.showSearch();
        else
            $.ajax({
                url: "//api.area51.onl/darwin/departures/" + stationCrs,
                dataType: 'json',
                cache: false,
                success: showCrsBoard
            });
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
    var showCrsBoard = function (data) {
        $('#boardName').empty().append(data.station.name);
        var tab = $('#boardTable');
        tab.empty();

        if (!data.departures || data.departures.length === 0) {
            // Show no data
            div().appendTo(tab).append("No data available");
        } else {
            var altrow = 0;

            // sort
            data.departures.sort(function (a, b) {
                return parseLocTime(a) - parseLocTime(b);
            });

            // Don't show too far in the future (we could see tomorrows data in here)
            var now = Date.now() + 86400000 - 3600000;
            $.each(data.departures, function (i, v) {
                // Don't go too far ahead
                if (parseLocTime(v) >= now)
                    return;

                // Hide non-public trains unless we want them
                if (!v.loc.pta && !v.loc.ptd)
                    return;

                // Optional hide terminating trains
                var terminates = v.dest.tpl.tiploc === v.loc.tpl.tiploc;
                if (terminates)
                    return;

                var row = div().appendTo(tab);
                altrow = 1 - altrow;
                if (altrow)
                    row.addClass("altrow");

                var d = div().addClass("ldb-enttop").appendTo(row)
                        .append(div().addClass("ldbCol").addClass("ldbForecast"))
                        .append(div().addClass("ldbCol").addClass("ldbSched").append(v.loc.ptd ? v.loc.ptd : v.loc.pta))
                        .append(div().addClass("ldbCol").addClass("ldbPlat").append(v.loc.plat ? v.loc.plat : ""));
                var cont = div().addClass("ldbCont").appendTo(d)
                        .append(a().append(terminates ? "Terminates here" : v.dest.tpl.name));
                if (v.via)
                    cont.append(span().addClass("ldbVia").append(" via " + v.via));

                if (!terminates) {
                    d = div().addClass("ldb-entbot").appendTo(row)
                            .append(span().addClass("ldbHeader").addClass("callList").append("Calling at:"));
                    // todo add cp list to api output, for now just the dest
                    d.append(span().addClass("callList").append(" ")
                            .append(a().append(a().append(v.dest.tpl.name).click(function (e) {
                                UI.showCRS(v.dest.tpl.crs);
                            })))
                            .append(" (").append((v.dest.pta ? v.dest.pta : v.dest.wta).substr(0, 5)).append(")"));
                }

                // Operator and last report lines
                d = div().addClass("ldb-entbot").appendTo(row);
                // todo add full name to toc
                if (v.toc)
                    d.append(span().append(v.toc).append("&nbsp;service. "));
                // todo last report
                //d.append(span().addClass("ldbHeader").append("Last report: "))
                //        .append(span().addClass("ldbDest").append(v.loc.tpl).append(" 00:00 "));
            });
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
            url: '//api.area51.onl/darwin/search?term=%QUERY',
            dataType: 'json',
            cache: false,
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
    if (1)
        UI.showCRS('VIC');
    else
    if (l.match("/mldb/[a-zA-Z]{3}"))
        UI.showCRS(l.substr(6));
    else if (l.match("/[a-zA-Z]{3}"))
        UI.showCRS(l.substr(1));
    else
        UI.showSearch();
});
