// Common UI functions
var host = null;

var UI = (function () {
    function UI() {
        UI.messageSpan = $('<div></div>');
        UI.message = $('#message').empty().append(UI.messageSpan);
        UI.loader = $('#loading');

        UI.settings = $('#settings');
        if (UI.settings.length > 0) {
            UI.settings.click(showSettings);
            UI.settingsPanel = $('#settingsPanel');
            $('#settingsCancel').click(hideSettings);
            $('#settingsSave').click(saveSettings);
            UI.defaultSettings();
        }
    }

    var set = function (v, d) {
        if ((typeof v === 'undefined' || v === null) && typeof d !== 'undefined')
            v = d;
        return v === 't';
    };

    UI.enabled = function (n) {
        return $.cookie(n) === 't';
    }

    UI.show = function (c, n, t, f) {
        c.css({display: $.cookie(n) === 't' ? t : f});
    };

    var showSettings = function () {
        var cookies = $.cookie();
        $.each(UI.settingsPanel.find('input'), function (i, c) {
            c = $(c);
            c.prop('checked', set(cookies[$(c).attr('name')], $(c).attr('default')));
        });
        UI.settingsPanel.css({display: 'block'});
    };

    var hideSettings = function () {
        UI.settingsPanel.css({display: 'none'});
    };

    UI.opts = {
        expires: 365,
        path: '/'
    };

    UI.defaultSettings = function () {
        if (typeof UI.settingsPanel !== 'undefined') {
            var cookies = $.cookie();
            $.each(UI.settingsPanel.find('input'), function (i, c) {
                c = $(c);
                var n = $(c).attr('name');
                if (typeof cookies[n] === 'undefined')
                    $.cookie(n, $(c).attr('default'), UI.opts);
            });
        }
    };

    var saveSettings = function () {
        $.each(UI.settingsPanel.find('input'), function (i, c) {
            c = $(c);
            $.cookie($(c).attr('name'), $(c).is(':checked') ? 't' : 'f', UI.opts);
        });
        if (typeof UI.settingsSaved !== 'undefined')
            UI.settingsSaved();
        hideSettings();
    };

    var showLoaderImpl = function () {
        UI.loader.css({display: 'block'});
    };

    /**
     * Hide the error message
     */
    UI.hideError = function () {
        UI.message.removeClass('messageVisible').addClass('messageHidden');
        UI.messageSpan.empty();
    };

    /**
     * Show an error message
     * @param {type} msg Message to show
     */
    UI.showError = function (msg) {
        UI.message.addClass('messageVisible').removeClass('messageHidden');
        UI.messageSpan.empty().append(msg);
    };

    /**
     * Shows the loading icon when connection is slow
     */
    UI.showLoader = function () {
        UI.hideError();
        UI.timer = setTimeout(showLoaderImpl, 25);
    };

    /**
     * Hine the loader icon
     */
    UI.hideLoader = function () {
        if (UI.timer) {
            clearTimeout(UI.timer);
            delete(UI.timer);
        }
        UI.loader.css({display: 'none'});
    };

    /**
     * Configure the station search box
     */
    UI.search = function () {
        $("#stations").autocomplete({
            source: host + "/api/departure/search",
            minLength: 3,
            autoFocus: true,
            select: function (event, ui) {
                document.location = "/mldb/" + ui.item.crs;
            }
        });

        // Give the search focus
        setTimeout(function () {
            $('#stations').val('').focus();
        }, 250);
    };

    return UI;
})();

var locname = function (v, tpl) {
    var l = v[tpl];
    return l ? l.loc ? l.loc.replace("&", "&amp;").replace(" ", "&nbsp;") : tpl : tpl;
};

var loccrs = function (v, tpl) {
    var l = v[tpl];
    return l ? l.crs ? l.crs : tpl : tpl;
};

var tocname = function (v, toc) {
    var l = v[toc];
    return l ? l : toc;
};

// Link to a station page
var linkStation = function (locref, tpl) {
    return $("<a></a>").attr({"href": "/mldb/" + loccrs(locref, tpl)}).append(locname(locref, tpl));
};

var dv = function () {
    return $('<div></div>');
};
var sp = function (h) {
    return $('<span></span>');
};
var sph = function (h) {
    return sp().addClass("ldbHeader");
};
var ta = function () {
    return $('<table></table>');
};
var tr = function () {
    return $('<tr></tr>');
};
var td = function () {
    return $('<td></td>');
};
var th = function () {
    return $('<th></th>');
};
var delay = function (d) {
    var e = s.contains('-') ? "E" : "L";
    var s = (d ? d : "").replace("PT", "").replace("30S", "").replace("0S", "").replace("-", "");
    return s === "" ? "OT" : (s + " " + e);
}

// Live Departure Boards, refresh every 60s
var LDB = (function () {

    function LDB(crs, time) {
        LDB.url = host + '/api/departure/board/' + crs;
        if (time !== 'null')
            LDB.url = LDB.url + '/' + time;
        LDB.board = $('#board');
        UI.settingsSaved = LDB.applySettings;
        reload();
    }

    var reloadIn = function (timeout) {
        if (timeout)
            setTimeout(reload, timeout);
        else
            LDB.reload();
    };

    // Begin a call list
    var callListHeader = function (row) {
        return dv().addClass("ldb-entbot").addClass("callList").appendTo(row);
    };

    var frc = function (f) {
        return f ? "Front coaches for " : "Rear coaches for ";
    };

    var callList = function (row, dep, split, locref, main) {
        var d = callListHeader(row);

        if (main)
            d.append(sp().append("Calling at: "));
        else if (split)
            d.append(sp().append(frc(dep.reverse)))
                    .append(sph().append(linkStation(locref, dep.split.dest.tpl)))
                    .append(" departing &nbsp;(" + dep.split.origin.time + ") ")
                    .append(sp().append(" calling at: "));

        var c = main ? dep.calling : split ? split.calling : null, d2 = null, d3 = false;
        if (c)
            $.each(c, function (i, cp) {
                if (d2) {
                    d.append(d2);
                    d3 = true;
                }
                d2 = sp().append(linkStation(locref, cp.tpl)).append("&nbsp;(" + cp.time + ") ");
                if (split && split.origin.tpl === cp.tpl) {
                    // BUG: 1756 TBD - Horsham & Tonbridge split is at Horsham & terminating point of main train so this message is not shown.
                    d.append(sp().append(" and&nbsp;"))
                            .append(d2)
                            .append(sp().append(" where&nbsp;the&nbsp;train&nbsp;divides."));
                    d2 = null;
                    d = callListHeader(row)
                            .append(sp().append(frc(!dep.reverse)))
                            .append(sph().append(linkStation(locref, dep.dest.tpl)))
                            .append(" departing &nbsp;(" + cp.time + ") ")
                            .append(sp().append(" calling at: "));
                }
            });
        if (d2) {
            if (d3)
                d.append(sp().append(" and&nbsp;"));
            d.append(d2);
        }
    };

    var success = function (v) {
        UI.hideLoader();
        //reloadIn(60000);
        LDB.board.empty();

        var d = dv().addClass("ldbWrapper").appendTo(LDB.board);

        var tab = $('<table></table>').addClass("ldbTable").appendTo(d);

        // station messages here

        // Departure details
        $.each(v.departures, function (i, dep) {
            var row = dv().addClass("row").appendTo(tab);
            if (dep.terminated || dep.term) {
                row.addClass("trainTerminated");
            }
            if (dep.canc) {
                row.addClass("callListCancelled");
            }
            if (dep.pass) {
                row.addClass("doesNotStopHere");
            }

            d = dv().addClass("ldb-enttop").appendTo(row);

            var d1 = dv().addClass("ldbCol").addClass("ldbForecast").appendTo(d);
            if (dep.canc) {
                d1.addClass("ldbCancelled").append("Cancelled");
            } else if (dep.delayed) {
                d1.addClass("ldbLate").append("Delayed");
            } else if (dep.arrived) {
                d1.addClass("ldbOntime").append("Arrived");
            } else if (dep.ontime) {
                d1.addClass("ldbOntime").append("On&nbsp;Time");
            } else if (dep.time) {
                d1.append(dep.time);
            } else {
                d1.append("N/A");
            }

            d1 = dv().addClass("ldbCol").addClass("ldbSched").appendTo(d);
            if (dep.timetable) {
                d1.append(dep.timetable);
            } else {
                d1.append("&nbsp;");
            }

            d1 = dv().addClass("ldbCol").addClass("ldbPlat").appendTo(d);
            if (dep.platsup) {
                d1.append("&nbsp;");
            } else {
                d1.append(dep.plat);
            }

            d1 = dv().addClass("ldbCont").appendTo(d);
            d1 = $("<a></a>").attr({"href": "/train/" + dep.rid}).appendTo(d1);
            if (dep.term) {
                d1.append("Terminates Here");
            } else if (dep.pass) {
                d1.append("Does not stop here");
            } else if (dep.dest) {
                d1.append(locname(v.locref, dep.dest.tpl));
                // via here
                // splits
                if (dep.split && !dep.term) {
                    d1.append(" &amp; " + locname(v.locref, dep.split.dest.tpl));
                    // via here
                }
            } else {
                d1.append("Check front of train");
            }

            // Cancelled or late reason
            if (dep.canc) {
                dv().addClass("ldb-entbot").appendTo(row)
                        .append(dv().addClass("ldbCancelled").append(dep.cancreason));
            } else if (dep.latereason > 0) {
                dv().addClass("ldb-entbot").appendTo(row)
                        .append(dv().addClass("ldbLate").append(dep.latereason));
            }

            if (dep.term && dep.origin) {
                d = dv().addClass("ldb-entbot").appendTo(row);
                d1 = dv().addClass("ldbLate").appendTo(d);
                d1.append("This was the " + tocname(v.opref, dep.toc) + " " + dep.origin.time + " service from " + locname(v.locref, dep.origin.tpl));
                // via here
            }

            // calling points
            if (!dep.term && !dep.canc) {
                callList(row, dep, dep.split, v.locref, true);
                if (dep.split)
                    callList(row, dep, dep.split, v.locref, false);
            }

            // metaData
            d = dv().addClass("ldb-entbot").appendTo(row);

            if (dep.length > 0)
                d.append(sp()
                        .append("Formed&nbsp;of&nbsp;" + dep.length + "&nbsp;coaches.&nbsp;"));

            if (dep.toc)
                d.append(sph().append("Operator:&nbsp;"))
                        .append(sp().append(tocname(v.opref, dep.toc)).append("&nbsp;"));

            if (dep.headcode)
                d.append(sph().append("HeadCode:&nbsp;"))
                        .append(sp().append(dep.headcode).append("&nbsp;"));

            if (dep.lastreport)
                d.append(sph().append("Last report:"))
                        .append(sp().addClass("ldbDest")
                                .append(locname(v.locref, dep.lastreport.tpl) + '&nbsp;' + dep.lastreport.time + "&nbsp;"));

            if (dep.eta)
                d.append(sph().append("Due:&nbsp;"))
                        .append(sp().append(dep.eta).append(" "));

            // Debug mode, show if point is timetable or realtime
            //if (dep.tt) {
            d.append(sp().append(dep.tt ? "&#964;" : "&#948;").append("&nbsp;"));
            d.append(sp().append(" RID: " + dep.rid));
            //}

        });

        LDB.applySettings();
    };

    LDB.applySettings = function () {
        if (!host) {
            UI.show($('.trainTerminated'), 'ldbTerm', 'block', 'none');
            UI.show($('.callList'), 'ldbCall', 'inline-block', 'none');
            UI.show($('.callListTerminated'), 'ldbTermCall', 'inline-block', 'none');
            UI.show($('.callListCancelled'), 'ldbCanCall', 'inline-block', 'none');
        }

        var r = 0;
        $.each($('.row'), function (i, c) {
            c = $(c);
            if (r % 2 === 0)
                c.addClass('altrow');
            else
                c.removeClass('altrow');
            if (!((c.hasClass('trainTerminated') && !UI.enabled('ldbTerm'))
                    || (c.hasClass('callList') && !UI.enabled('ldbCall'))
                    || (c.hasClass('callListTerminated') && !UI.enabled('ldbTermCall'))
                    || (c.hasClass('callListCancelled') && !UI.enabled('ldbCanCall'))
                    ))
                r++;
        });
    };

    var notModified = function (v) {
        UI.hideLoader();
        reloadIn(10000);
    }

    var failure = function (v) {
        UI.hideLoader();
        UI.showError("Failed to connect to server<br />Will attempt again shortly.");
        reloadIn(10000);
    };

    var reload = function () {
        UI.showLoader();
        $.ajax({
            url: LDB.url,
            type: 'GET',
            async: true,
            statusCode: {
                200: success,
                // Shouldn't but may occur, retry in 10 seconds
                304: notModified,
                // tomcat is up but no app
                404: failure,
                // Internal error
                500: failure,
                // Proxy error
                502: failure,
                // apache is up but no tomcat
                503: failure,
            }
        });
    };

    return LDB;
})();

// Train details - refresh every 60s
var Train = (function () {
    function Train(rid, detailed) {
        Train.rid = rid;
        Train.board = $('#board');
        var ib = $('#inner-banner');
        Train.loc = dv().appendTo(ib).addClass('ldbLoc');

        var d = dv().appendTo(ib).attr({'style': 'position: absolute;top: 1px;right: 1px;'});
        Train.mode = $('<a></a>').addClass('ldbbutton').appendTo(d).click(setMode);

        // Now toggle the mode - hence !
        Train.detailed = !detailed;
        setMode();
    }

    var setMode = function (e) {
        Train.detailed = !Train.detailed;
        Train.url = host + '/api/departure/train/' + (Train.detailed ? 'full' : 'short') + '/' + Train.rid;
        Train.mode.empty().append("Switch&nbsp;to&nbsp;" + (Train.detailed ? "basic" : "detailed") + "&nbsp;mode");
        reload();
    }
    var reloadIn = function (timeout) {
        if (timeout)
            setTimeout(reload, timeout);
        else
            reload();
    };
    var nr = function (d0) {
        return dv().addClass("ldb-row").appendTo(d0);
    };
    var ts = function (v) {
        return v ? v : "&nbsp;";
    };
    var trainhd = function (tab, v, t, s) {
        return tab.append(tr().append(td().append('&nbsp;')))
                .append(tr().append(td()
                        .attr({
                            'colspan': s,
                            'style': 'text-align:center;'
                        })
                        .append(locname(v.locref, t.origin.tpl) + " to " + locname(v.locref, t.dest.tpl))
                        ));
    };
    var train = function (v, t, main, d0) {

        var tab = ta().appendTo(nr(d0));
        if (!main)
            trainhd(tab, v, t, 5)
                    .append(tr().append(td().append('&nbsp;')));
        tab.append(tr()
                .append(th().append("Head code"))
                .append(th().append("Operator"))
                .append(th().append("Last report"))
                .append(th().append("UID"))
                .append(th().append("RID"))
                )
                .append(tr()
                        .append(td().append(t.headcode))
                        .append(td().append(tocname(v.opref, t.toc)))
                        .append(td().append(t.lastReport ? (locname(v.locref, t.lastReport.tpl) + " at " + t.lastReport.time) : ""))
                        .append(th().append(t.uid))
                        .append(td().append($('<a></a>').attr({'href': '//uktra.in/rtt/train/' + t.rid}).append(t.rid)))
                        );
        if (!main)
            tab.append(tr().append(td().append('&nbsp;')));

        tab = ta().appendTo(nr(d0));
        if (main)
            trainhd(tab, v, t, Train.detailed ? 8 : 6);

        // detailed uses last report rather than last stop on this display
        // lr = tpl of last report or stop in basic mode
        // ls true if last report was a stop and not moving
        // lrf true if lr is not null & we are before that point
        var lr = Train.detailed ? t.lastReport : t.lastStop ? t.lastStop : t.lastReport;
        lr = lr ? lr.tpl : null;
        var lrf = lr !== null;
        var r = tr().appendTo(tab)
                .append(th().append('&nbsp;'))
                .append(th().append('Location'))
                .append(th().append('Plat'))
                .append(th().append('Arr')).append(th().append('Dep'));
        if (Train.detailed)
            r.append(th().append('Arr')).append(th().append('Dep'));
        r.append(th().append('Delay'));

        $.each(t.calling, function (i, cp) {
            //console.log(i, lrf, cp);
            var st = t.canc ? "can" : cp.wtp ? "pass" : lrf ? "arr" : "expt";
            r = tr().appendTo(tab)
                    .append(td().addClass("ldb-fsct-stat"))
                    .append(td().addClass("ldb-fsct-loc-" + st).append(locname(v.locref, cp.tpl)))
                    .append(td().addClass(cp.wtp ? "ldb-fsct-pass" : "ldb-fsct-plat-" + st).append(cp.platSup ? "N/A" : cp.plat));
            // Darwin forecast data. f is true to show planned data, so detailed mode or if this block doesnt show anything
            var f = Train.detailed;
            if (cp.canc)
                r.append(td().addClass("ldb-fsct-csncelled").attr({"colspan": 2}).append("Cancelled"));
            else if (cp.atp)
                r.append(td().addClass("ldb-fsct-passed").attr({"colspan": 2}).append("Pass&nbsp;" + cp.atp));
            else if (cp.ata || cp.atd)
                r.append(td().addClass("ldb-fsct-arrived").append(cp.ata))
                        .append(td().addClass("ldb-fsct-arrived").append(cp.atd));
            else if (cp.etp)
                r.append(td().addClass("ldb-fsct-pass").attr({"colspan": 2}).append("Pass&nbsp;" + cp.etp));
            else if (cp.eta || cp.etd)
                r.append(td().addClass("ldb-fsct-expected").append(cp.eta))
                        .append(td().addClass("ldb-fsct-expected").append(cp.etd));
            else if (lrf)
                r.append(td().addClass(cp.wtp ? "ldb-fsct-pass" : "ldb-fsct-expected").attr({"colspan": 2}).append("No&nbsp;report"));
            else if (Train.detailed)
                r.append(td().addClass("ldb-fsct-expected").attr({"colspan": 2}).append("&nbsp;"));
            else
                f = true;

            if (f && (cp.pta || cp.ptd))
                r.append(td().addClass("ldb-fsct-expected").append(cp.pta))
                        .append(td().addClass("ldb-fsct-expected").append(cp.ptd));
            else if (f && cp.ptp)
                r.append(td().addClass("ldb-fsct-pass").attr({"colspan": 2}).append("Pass&nbsp;" + cp.ptp));
            else if (f && (cp.wta || cp.wtd))
                r.append(td().addClass("ldb-fsct-expected").append(cp.wta))
                        .append(td().addClass("ldb-fsct-expected").append(cp.wtd));
            else if (f && cp.wtp)
                r.append(td().addClass("ldb-fsct-pass").attr({"colspan": 2}).append("Pass&nbsp;" + cp.wtp));
            else if (f)
                r.append(td().addClass("ldb-fsct-expected").attr({"colspan": 2}).append("&nbsp;"));

            r.append(td().addClass("ldb-fsct-expected").append(cp.delay));
            //r.append(td().addClass("ldb-fsct-expected").append("L" ).append( cp.length > 0 ? cp.length : ""));

            if (t.split && cp.tpl === t.split.origin.tpl)
                r = tr().appendTo(tab)
                        .append(td().addClass("ldb-fsct-stat"))
                        .append(td().addClass("ldb-fsct-loc-" + st)
                                .attr({'colspan': Train.detailed ? 6 : 4, 'style': 'color:yellow;'})
                                .append('&nbsp;&nbsp;&nbsp;where the train ' +
                                        (t.split.origin.atd ? 'divided' : 'divides')
                                        + ' for ')
                                .append($("<a></a>").attr({"href": "/train/" + t.split.rid}).append(locname(v.locref, t.split.dest.tpl)))
                                .append(" departing at " + t.split.origin.time)
                                );

            if (lrf && cp.tpl === lr)
                lrf = false;
        });
    };

    var success = function (v) {
        UI.hideLoader();
        reloadIn(60000);
        Train.board.empty();
        var d0 = dv().addClass("ldbWrapper").appendTo(Train.board);

        Train.loc.empty()
                .append(locname(v.locref, v.dest.tpl));
        // via here

        if (v.split) {
            Train.loc.append(" & ")
                    .append(locname(v.locref, v.split.dest.tpl));
            // via here
        }

        train(v, v, true, d0);
        if (v.split||v.joins||v.nextTrain) {
            //train(v, v.split, false, d0);
            var tab = ta().appendTo(nr(d0))
                    .append(tr().append(td().append('&nbsp;')))
                    .append(tr().append(td().append('Asscoiations').attr({'colspan': 7})))
                    .append(tr()
                            .append(th().append('Type'))
                            .append(th().append('Head&nbsp;Code'))
                            .append(th().append('Origin'))
                            .append(th().append('P'))
                            .append(th().append('Dep'))
                            .append(th().append('Arr'))
                            .append(th().append('P'))
                            .append(th().append('Destination'))
                            .append(th().append('Last&nbsp;Report'))
                            );
            showassoc(tab, 'Primary', v, v);
            showassoc(tab, 'Split', v, v.split);
            showassoc(tab, 'Joins', v, v.joins);
            showassoc(tab, 'Next', v, v.nextTrain);
        }
    };

    var showassoc = function (tab, t, v, a) {
        if (a) {
            tab.append(tr()
                    .append(td().append(t))
                    .append(td().append($("<a></a>").attr({"href": "/train/" + a.rid}).append(a.headcode)))
                    .append(td().append(locname(v.locref, a.origin.tpl)))
                    .append(td().append(a.origin.platSup ? "N/A" : a.origin.plat))
                    .append(td().append(locname(v.locref, a.origin.time)))
                    .append(td().append(locname(v.locref, a.dest.time)))
                    .append(td().append(a.dest.platSup ? "N/A" : a.dest.plat))
                    .append(td().append(locname(v.locref, a.dest.tpl)))
                    .append(td().append(a.lastReport ? locname(v.locref, a.lastReport.tpl) + "&nbsp;" + a.lastReport.time : ''))
                    );
        }
    };

    var notModified = function (v) {
        UI.hideLoader();
        reloadIn(10000);
    };
    var failure = function (v) {
        UI.hideLoader();
        UI.showError("Failed to connect to server<br />Will attempt again shortly.");
        reloadIn(10000);
    };
    var reload = function () {
        UI.showLoader();
        $.ajax({
            url: Train.url,
            type: 'GET',
            async: true,
            statusCode: {
                200: success,
                // Shouldn't but may occur, retry in 10 seconds
                304: notModified,
                // tomcat is up but no app
                404: failure,
                // Internal error
                500: failure,
                // Proxy error
                502: failure,
                // apache is up but no tomcat
                503: failure
            }
        });
    };
    return Train;
})();