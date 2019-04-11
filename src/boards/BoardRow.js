import React, {Component} from 'react';
import {withRouter} from 'react-router';
import config from 'react-global-configuration';

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
    return <span key={cp.tpl + ":" + cp.time} className="callList"><a
        onClick={t.showBoard(cp.tpl)}
    >{fix(tiploc(data, cp.tpl))}</a>&nbsp;({fixTime(cp.time)}) </span>
}

// Used to fix calling point names so they don't break
function fix1(s, a, b) {
    while (s.indexOf(a) >= 0)
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
            data = this.props.data,
            train = this.props.departure,
            loc = train.location,
            timetable = loc.timetable,
            forecast = loc.forecast,
            plat = forecast ? forecast.plat : null,
            time = timetable ? timetable.time : null,
            // Train's been cancelled at this location
            cancelled = loc.cancelled,
            // train terminates here
            terminatesHere = data.tiploc[train.destination] && data.tiploc[train.destination].crs === this.props.crs,
            // destination text
            destination = getDestination(data, train.destination, train.rid),
            // For splits
            splits, splitsTrain,
            // For joins
            joins, joinsTrain,
            message, calling, delay, lastReport;

        //console.log( train )
        if (terminatesHere) {
            destination = 'Terminates Here';
        } else if (train.association && train.association.length > 0) {
            for (let a of train.association) {
                if (!a.cancelled) {
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

                            destination =
                                <span>{destination} &amp; {getDestination(data, splitsTrain.destinationLocation.tiploc, splitsTrain.rid)}</span>;
                            break;
                        case 'JJ':
                            joins = a;
                            joinsTrain = a.schedule;
                            destination =
                                <span>{destination} &amp; {getDestination(data, joinsTrain.destinationLocation.tiploc, joinsTrain.rid)}</span>;
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        let expected = 'On Time', expectedClass = 'ldbOntime';
        if (loc.cancelled) {
            expected = 'Cancelled';
            expectedClass = 'ldbCancelled';
        } else if (forecast && forecast.arrived)
            expected = 'Arrived';
        else if (forecast && forecast.departed)
            expected = 'Departed';
        else if (forecast && forecast.delayed) {
            expected = 'Delayed';
            expectedClass = 'ldbLate';
        } else if (loc.delay > 0) {
            // forecast will not be null here as this is calculated from it
            expected = fixTime(forecast.time);
            expectedClass = 'ldbLate';
        }

        if (train.lastReport) {
            lastReport = <span>
        <span>Last report:</span>
        <span className="ldbDest"> {tiploc(data, train.lastReport.tpl)} {fixTime(train.lastReport.time)} </span>
      </span>;
        }

        let toc = train.toc && data.toc && data.toc[train.toc] ?
            <span> {data.toc[train.toc].tocname}&nbsp;service. </span> : null;

        let length = !cancelled && forecast && forecast.length > 0 ?
            <span>
              <span>Formed of:</span>
              <span className="ldbDest"> {forecast.length} coaches</span>
            </span>
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

        if (train.calling && train.calling.length > 0 && !config.get("hideCalling")) {
            let cps = [[], [], []], cpi = 0, s1, s2, i, s1origin, kid = 0, cpi1 = 0;
            for (i = 0; i < train.calling.length; i++) {
                let cp = train.calling[i],
                    split = splits && cp.tpl === splits.tiploc,
                    last = i > cpi1 && (i + 1) === train.calling.length;
                if (split || last) {
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
                s1 = <div>
                    <span
                        className="callList">{fix(tiploc(data, train.destination))} portion calls at:</span> {cps[1]}
                </div>
            }
            if (cps[2].length) {
                s2 = <div><span
                    className="callList">{fix(tiploc(data, splitsTrain.destinationLocation.tiploc))} portion departing {fixTime(splitsTrain.calling[0].time)} calls at:</span> {cps[2]}
                </div>
            }
            calling = <div className="ldb-entbot">
                <div><span className="callList"> Calling at:</span> {cps[0]}</div>
                {s1}
                {s2}
            </div>;
        }

        if (!cancelled && loc.delay && Math.abs(loc.delay) >= 60) {
            let m = Math.floor(Math.abs(loc.delay / 60)), s = Math.abs(loc.delay % 60);
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
            {calling}
            {delay}
            <div className="ldb-entbot">{toc}{length}{lastReport}</div>
        </div>;
    }
};

export default withRouter(BoardRow);
