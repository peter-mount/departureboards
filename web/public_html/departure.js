var UI = (function () {
    function UI() {

    }
    UI.urlChange = function (l) {
        // Comment out when running within NetBeans
        //history.pushState(history.state, null, l);
    };

    var panes = ['#searchPane', '#boardPane'];
    UI.show = function (id) {
        $.each(panes, function (i, p) {
            $(p).css({display: p === id ? "block" : "none"});
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
            $('#stations').val('').focus();
        }, 250);
    };

    // Parse received json into stationResults & typeahead
    UI.stationSearch = function (parsedResponse) {
        stationResults = {};
        var ary = $.map(parsedResponse, function (loc) {
            loc.text = loc.name + " [" + loc.crs + "]";
            stationResults[loc.text] = loc;
            return loc.text;
        });
        return ary;
    };

    // Select station
    UI.stationSearchOn = function (e) {
        var t = $('#stations').val();
        var loc = stationResults[t];
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
    var parseTime = function(t) {
        var a=t.split(':');
        return (+a[0]*60)+(+a[1]);
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
            
            data.departures.sort(function(a,b){
                var at=parseTime(a.loc.ptd?a.loc.ptd:a.loc.pta?a.loc.pta:a.loc.wtd?a.loc.wtd:a.loc.wta);
                var bt=parseTime(b.loc.ptd?b.loc.ptd:b.loc.pta?b.loc.pta:b.loc.wtd?b.loc.wtd:b.loc.wta);
                return at-bt;
            });
            var lrid="";
            $.each(data.departures, function (i, v) {
                // Hide non-public trains unless we want them
                if (!v.loc.pta && !v.loc.ptd)
                    return;

                var row = div().appendTo(tab);
                altrow = 1 - altrow;
                if (altrow)
                    row.addClass("altrow");

                var terminates = v.dest.tpl.tiploc === v.loc.tpl.tiploc;

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
                            .append(a().append(v.dest.tpl.name))
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
    console.log("init");
    $('#stations').typeahead({
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
//    if (l.match("/[a-zA-Z]{3}"))
//        UI.showCRS(l.substr(1));
//    else
//        UI.showSearch();
    UI.showCRS('MDE');
});
