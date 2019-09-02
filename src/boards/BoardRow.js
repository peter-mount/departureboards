import React, {Component} from 'react';
import {withRouter} from 'react-router';
import config from 'react-global-configuration';

import Loading from './Loading.js';

function tiploc(d, tpl) {
    return d.tiploc[tpl] ? d.tiploc[tpl].locname : tpl
}

function getDestination(data, tpl, rid) {
    let via;
    if (data.via && data.via[rid]) {
        via = <span className="ldb-entbot">{data.via[rid].text}</span>
    }
    return <span>{tiploc(data, tpl)} {via}</span>
}

function getCallingPoint(t, data, cp) {
    return <span key={cp.tpl + ":" + cp.time + ':' + cp.delay} className="callList"><a
        onClick={t.showBoard(cp.tpl)}
    >{fix(tiploc(data, cp.tpl))}</a>&nbsp;({fixTime(cp.time)}) </span>
}

function getLastReport(t, data, lr) {
    let cp = getCallingPoint(t, data, lr),
        at = lr.passed ? 'passing'
            : lr.approaching ? 'approaching'
                : lr.departed ? 'departed'
                    : lr.at ? 'at'
                        : lr.delayed ? 'delayed at'
                            : "att";

    return <span><span className="callList">Last Report {at}</span> {cp}</span>
}

function getLastReportPrevService(t, data, lr) {
    let cp = getCallingPoint(t, data, lr),
        at = lr.passed ? 'passed'
            : lr.approaching ? 'approaching'
                : lr.departed ? 'departed'
                    : lr.at ? 'at'
                        : lr.delayed ? 'delayed at'
                            : "at",
        prefix = lr.departed || lr.passed ? 'has' : 'is currently';

    return <div className="ldb-entbot"><span
        className="callList">The train forming this service {prefix} {at}</span> {cp}</div>
}

// Used to fix calling point names so they don't break
function fix1(s, a, b) {
    while (s && s.indexOf(a) >= 0)
        s = s.replace(a, b);
    return s;
}

function fix(s) {
    return fix1(s, ' ', '\u00A0');
}

function fixTime(t) {
    if (t) {
        let a = t.split(':');
        return a[0] + ':' + a[1]
    }
    return null
}

export function timeRemaining(t) {
    t = fixTime(t);
    if (t) {
        let a = t.split(':'),
            tt = (a[0] * 60) + (a[1] * 1),
            now = new Date(),
            nt = (now.getHours() * 60) + now.getMinutes(),
            dt = tt - nt;

        // Try to handle crossing midnight 1380 = 23:00 in minutes
        if (nt > 1380 && dt < -1380) {
            dt = dt + 1440
        }

        if (dt > 1 && dt < 10) {
            return dt + " mins"
        } else if (dt > 0 && dt <= 1) {
            return "1 min"
        }
    }
    return null
}

function reason(cancelled, reason, data) {
    let m;
    if (data.reasons) {
        if (cancelled && data.reasons.cancelled) {
            m = data.reasons.cancelled[reason.reason];
        } else if (!cancelled && data.reasons.late) {
            m = data.reasons.late[reason.reason];
        }
        m = m ? m.reasontext : ("reason " + reason.reason)
    }
    if (reason.tiploc) {
        m = m + (reason.near ? ' near ' : ' at ') + tiploc(data, reason.tiploc)
    }
    return m
}

// returns true if the association's tiploc is within the train's calling points
// i.e. we have not yet split
function assocValid(a, c) {
    return a && c && c.filter(cp => a.tiploc === cp.tpl).length
}

/*
 * A row on the board showing current status of a train
 */
class BoardRow extends Component {

    showBoard(tpl) {
        let data = this.props.data;
        if (data.tiploc && data.tiploc[tpl] && data.tiploc[tpl].crs) {
            let crs = data.tiploc[tpl].crs;
            return () => {
                this.props.history.push('/departures/' + crs);
            };
        }
        return () => {
        }
    }

    render() {
        let history = this.props.history,
            props = this.props,
            data = props.data,
            train = props.departure,
            crs = props.crs,
            showCountdown = props.showCountdown,
            flashExpected = props.flashExpected,
            flashTick = props.flashTick,
            loc = train.location,
            timetable = loc.timetable,
            forecast = loc.forecast,
            plat = forecast ? forecast.plat : null,
            time = timetable ? timetable.time : null,
            // Train is at the platform
            arrived = forecast && forecast.arrived,
            // Train's been cancelled at this location
            cancelled = loc.cancelled,
            // train terminates here
            terminatesHere = data.tiploc[train.destination] && data.tiploc[train.destination].crs === this.props.crs,
            // destination text
            destination = getDestination(data, train.destination, train.rid),
            // For splits
            splits, splitsTrain,
            // For joins
            joins, joinsTrain, joinsThisTrain, joining,
            message, calling, delay, lastReport, prefLastReport,
            // Coach loading & Toilets
            loading;

        if (terminatesHere) {
            destination = 'Terminates Here';
        } else if (train.association && train.association.length > 0) {
            for (let a of train.association) {
                if (!a.cancelled && assocValid(a, train.calling)) {
                    const assocHere = data.tiploc[a.tiploc] && data.tiploc[a.tiploc].crs === crs;

                    switch (a.category) {
                        case 'VV':
                            splits = a;
                            splitsTrain = a.schedule;

                            // Generate callingPoints for the entire service
                            // TODO remove when ldb provides this which will fix via's for splits
                            splitsTrain.calling = [];
                            for (let l of splitsTrain.locations) {
                                // Don't show intermediate points
                                if ((l.timetable && (l.timetable.pta || l.timetable.ptd)) || !((l.forecast && l.forecast.pass) || (l.timetable && l.timetable.wtp) || l.type === 'PP')) {
                                    splitsTrain.calling.push({tpl: l.tiploc, time: l.displaytime})
                                }
                            }

                            // Only add the second destination if we are the main association and we are not displaying
                            // the tiploc for this station - i.e. we are splitting here
                            // TODO add check for splitting at this station to this rule
                            if (train.rid === a.main.rid) {
                                destination =
                                    <span>{destination} &amp; {getDestination(data, splitsTrain.destinationLocation.tiploc, splitsTrain.rid)}</span>;
                            }
                            break;
                        case 'JJ':
                            if (assocHere) {
                                joins = a;
                                joinsTrain = a.schedule;
                                joinsThisTrain = a.main.rid === train.rid;
                            }
                            break;
                        default:
                            break;
                    }

                }
            }
        }

        let expected = 'On Time',
            expectedClass = 'ldbOntime',
            expectedTime = showCountdown ? timeRemaining(forecast.time) : null;

        if (loc.cancelled) {
            expected = 'Cancelled';
            expectedClass = 'ldbCancelled';
            flashTick = 0
        } else if (arrived) {
            expected = 'Arrived';
            flashTick = 0
        } else if (forecast && forecast.departed) {
            // Should not be shown but sometimes is
            expected = 'Departed';
            flashTick = 0
        } else if (forecast && forecast.delayed) {
            expected = 'Delayed';
            expectedClass = 'ldbLate';
            flashTick = 0
        } else if (loc.delay > 0) {
            // Flash every 2 seconds between minutes remaining & expected time
            if (showCountdown && expectedTime && (!flashExpected || (flashTick % 4) < 2)) {
                expected = expectedTime
            } else {
                expected = fixTime(forecast.time);
            }
            expectedClass = 'ldbLate';

        } else if (showCountdown && expectedTime) {
            // Override expected time
            expected = expectedTime
        }

        // Train's current location
        if (!arrived) {
            // Last report when the service is running
            if (train.lastReport && train.lastReport.tpl !== "") {
                lastReport = getLastReport(this, data, train.lastReport)
            }

            // Last report if not yet running but we know the previous service
            if (!lastReport && train.association) {
                for (let assoc of train.association) {
                    if (assoc.category === 'NP') {
                        const as = assoc.assoc,
                            ash = assoc.schedule,
                            lr = ash ? ash.lastReport : null;
                        if (ash && as.rid === train.rid && lr && lr.tpl !== "" && lr.tpl !== train.origin.tiploc) {
                            prefLastReport = getLastReportPrevService(this, data, lr)
                        }
                    }
                }
            }
        }

        let toc = train.toc && data.toc && data.toc[train.toc] ?
            <span> {data.toc[train.toc].tocname}&nbsp;service{config.get("showHeadcodes") ? (" " + train.trainId) : null} </span> : null;

        if (!cancelled && (loc.loading || (train.formation && train.formation.rid === train.rid))) {
            loading = <Loading data={data} rid={train.rid} loading={loc.loading} formation={train.formation}/>

            // Use the loading or formation length for length if not supplied
            if (!loc.length) {
                if (loc.loading && loc.loading.loading) {
                    loc.length = loc.loading.loading.length
                } else if (train.formation.rid === train.rid) {
                    loc.length = train.formation.formation.coaches
                }
            }
        }

        let length = !cancelled && loc.length > 0 ?
            <span><span>{toc ? 'formed' : 'formed'} of </span><span
                className="ldbDest">{loc.length}</span><span> coaches </span></span>
            : null;

        if (cancelled && train.cancelReason && train.cancelReason.reason > 0) {
            message = <div className="ldb-entbot">
                <div className="ldbCancelled">{reason(true, train.cancelReason, data)}</div>
            </div>;
        } else if (train.lateReason && train.lateReason.reason > 0) {
            message = <div className="ldb-entbot">
                <div className="ldbLate">{reason(false, train.lateReason, data)}</div>
            </div>;
        }

        if (train.calling && train.calling.length > 0) {
            let startsFrom, s0, s1, s2;

            // Cancelled then see if it starts later
            if (cancelled && train.calling && train.calling.length) {
                const cp = train.calling[0];

                startsFrom =
                    <span><span className="callList">This train will start from </span>{getCallingPoint(this, data, cp)}</span>;

                // Remove all callingpoints with the same tiploc - can happen during disruption
                while (train.calling.length && train.calling[0].tpl === cp.tpl) {
                    train.calling = train.calling.slice(1, train.calling.length);
                }
            }

            if (!config.get("hideCalling")) {
                let cps = [[], [], []], cpi = 0, i, s1origin, kid = 0, cpi1 = 0;
                for (i = 0; i < train.calling.length; i++) {
                    let cp = train.calling[i],
                        split = splits && cp.tpl === splits.tiploc,
                        join = joins && cp.tpl === joins.tiploc,
                        last = i > cpi1 && (i + 1) === train.calling.length;
                    if (join || split || last) {
                        cps[cpi].push(<span key={kid++} className="callList"> and </span>)
                    }

                    cps[cpi].push(getCallingPoint(this, data, cp));

                    if (split) {
                        cps[cpi].push(<span key={kid++}
                                            className="callList"> where&nbsp;the&nbsp;train&nbsp;divides.</span>);
                        s1origin = cp;
                        cpi = 1;
                        cpi1 = i + 1
                    }
                }

                if (cpi) {
                    // Skip the first point
                    for (i = 1; i < splitsTrain.calling.length; i++) {
                        let cp = splitsTrain.calling[i],
                            last = i > 1 && (i + 1) === splitsTrain.calling.length;
                        if (last) {
                            cps[2].push(<span key={kid++} className="callList"> and </span>)
                        }
                        cps[2].push(getCallingPoint(this, data, cp))
                    }
                }

                if (cps[1].length) {
                    let via = (data.via && data.via[train.rid]) ? data.via[train.rid].text : "service";
                    s1 = <div>
                    <span
                        className="callList">{fix(tiploc(data, train.destination))} {via} calls at:</span> {cps[1]}
                    </div>
                }
                if (cps[2].length) {
                    let via = (data.via && data.via[splitsTrain.rid]) ? data.via[splitsTrain.rid].text : "service";
                    s2 = <div><span
                        className="callList">{fix(tiploc(data, splitsTrain.destinationLocation.tiploc))} {via} departing {fixTime(splitsTrain.calling[0].time)} calls at:</span> {cps[2]}
                    </div>
                }

                s0 = <span><span className="callList"> {startsFrom ? 'calling' : 'Calling'} at</span> {cps[0]}</span>
            }
            calling = <div className="ldb-entbot">
                <div>{startsFrom}{s0}</div>
                {s1}{s2}</div>;
        }

        if (joins) {
            // Say a service will join here
            if (joinsThisTrain && !joins.assoc.cancelled) {
                let originLocation = joinsTrain.originLocation;
                joining = <div className="ldb-entbot">
                    <div>
                    <span className="callList">
                        The {fixTime(originLocation.displaytime)} service from <a
                        onClick={() => this.props.history.push('/service/' + joinsTrain.rid)}>{fix(tiploc(data, originLocation.tiploc))}</a> will attach here
                    </span>
                    </div>
                </div>
            }
            // Say a service joins another
            if (!joinsThisTrain && !joins.main.cancelled) {
                let destinationLocation = joinsTrain.destinationLocation;
                joining = <div className="ldb-entbot">
                    <div>
                    <span className="callList">
                        This service will attach at {fix(tiploc(data, destinationLocation.tiploc))} and continue to {fix(tiploc(data, train.dest.tiploc))} due {fixTime(destinationLocation.displaytime)}
                    </span>
                    </div>
                </div>
            }
        }

        if (!cancelled && loc.delay && Math.abs(loc.delay) >= 60) {
            let
                m = Math.floor(Math.abs(loc.delay / 60))
                ,
                s = Math.abs(loc.delay % 60);
            delay = <div className="ldb-entbot">
                <div className="ldbLate">This train is
                    running {m} {m > 1 ? "minutes" : "minute"}{s ? " " + s + "s" : ""} {loc.delay > 0 ? "late" : "early"}</div>
            </div>;
        }

        return <div className={this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row"}>
            <div className="ldb-enttop">
                <div className={"ldbCol ldbForecast " + expectedClass}>{expected}</div>
                <div className={"ldbCol ldbSched"}>{fixTime(time)}</div>
                <div
                    className="ldbCol ldbPlat">{plat && !plat.suppressed && !plat.cisSuppressed ? plat.plat : null}</div>
                <div className="ldbCont">
                    <a onClick={() => this.props.history.push('/service/' + train.rid)}>{destination}</a>
                </div>
            </div>
            {message}
            {loading}
            {calling}
            {joining}
            <div className="ldb-entbot">{toc}{length}{lastReport}</div>
            {prefLastReport}
            {delay}
        </div>;
    }
}
;

export default withRouter(BoardRow);
