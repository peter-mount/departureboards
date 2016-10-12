var UI = (function () {
    function UI() {

    }
    UI.urlChange = function (l) {
        // Comment out when running within NetBeans
        //history.pushState(history.state, null, l);
    };

    var panes = ['#searchPane', '#boardPane'];
    UI.show = function (id) {
        console.log("show", id);
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
    UI.showCRS = function (crs) {
        crs = crs.toUpperCase();
        UI.urlChange('/' + crs);
        UI.show("#boardPane");
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
    if (l.match("/[a-zA-Z]{3}"))
        UI.showCRS(l.substr(1));
    else
        UI.showSearch();
});
