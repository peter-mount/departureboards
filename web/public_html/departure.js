var UI = (function () {
    function UI() {

    }

    var panes = ['#searchPane'];
    UI.show = function (id) {
        console.log("show", id);
        $.each(panes, function (i, p) {
            $(p).css({display: p === id ? "block" : "none"});
        });
    };

    UI.showSearch = function () {
        UI.show("#searchPane");
        setTimeout(function () {
            $('#stations').val('').focus();
        }, 250);
    };

    UI.showAbout = function () {
        $("#about").modal();
    };

    UI.showContact = function () {
        $("#contactus").modal();
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
            filter: function (parsedResponse) {
                var ary = $.map(parsedResponse, function (loc) {
                    return loc.name;
                });
                console.log("ary", ary);
                return ary;
            }
        }
    }).on("typeahead:selected",function(e){
        console.log("selected", $('#stations').val());
    });
//    $('#stations').typeahead({
//        hint: true,
//        highlight: true,
//        minLength: 3,
//        async: true
//    },{
//        name: "stations",
//        source: function (query, syncResult, asyncResult) {
//            console.log(query);
//            return $.get('//api.area51.onl/darwin/search',
//                    {term: query},
//                    function (d) {
//                        console.log(d);
//                        return asyncResult({"mde":"d"});
//                    });
//        }
//    });

//    $("#stations").autocomplete({
//        source: "//api.area51.onl/darwin/search",
//        minLength: 3,
//        autoFocus: true,
//        select: function (event, ui) {
//            console.log(ui.item);
//            //document.location = "/mldb/" + ui.item.crs;
//        }
//    });

    UI.showSearch();
});
