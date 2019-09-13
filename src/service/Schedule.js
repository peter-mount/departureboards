import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Movement from './Movement.js';
import config from 'react-global-configuration';

import Location from '../util/Location.js';
import Reason from '../util/Reason.js';
import Time from '../util/Time.js';
import Via from '../util/Via.js';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrain} from "@fortawesome/free-solid-svg-icons/faTrain";

/*
 * Handles the Schedule tab
 */
class Schedule extends Component {

    componentDidMount() {
        this.ensureTrainVisible()
    }

    componentDidUpdate() {
        this.ensureTrainVisible()
    }

    ensureTrainVisible() {
        // Attempt to ensure the current position of the train is visible
        const data = this.props.service,
            service = data.service,
            lastReport = service.lastReport;

        if (lastReport) {
            let dom = ReactDOM.findDOMNode(this.refs['r' + service.rid + '_' + lastReport.id]);
            if (dom.scrollIntoView) {
                dom.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                });
            } else {
                console.log("scrollIntoView unsupported");
            }
        }
    }

    render() {
        const data = this.props.service,
            service = data.service,
            rid = service.rid,
            association = data.service.association,
            via = data.via ? data.via : {};

        let terminated;
        if (service && service.destinationLocation && service.terminatedAt && service.destinationLocation.tiploc !== service.terminatedAt.tiploc) {
            let t = service.terminatedAt.displaytime.split(':');
            terminated = <div>This service was terminated at <Location data={data}
                                                                       tiploc={service.terminatedAt.tiploc}/> at {t[0]}:{t[1]}
            </div>
        }

        // Destination and any associations
        let dest = <span><Location data={data} tiploc={service.destinationLocation.tiploc}/> <Via
                via={via[service.rid]}/></span>,
            joins,
            nextService,
            prevService,
            splits;
        if (association) {
            for (let a of association) {
                // We split at a station & then continue on, the other service then continues to a new destination
                if (a.category === 'VV' && !a.cancelled && rid === a.main.rid) {
                    splits = a;
                    dest = <span>{dest} &amp; <Location data={data} tiploc={a.assoc.destination.tiploc}/> <Via
                        via={via[a.assoc.rid]}/></span>
                }

                // We join another train at our destination
                if (a.category === 'JJ' && !a.cancelled && rid === a.assoc.rid) {
                    joins = a;
                }

                // We form a new service from the destination
                if (a.category === 'NP' && !a.cancelled) {
                    if (rid === a.main.rid) {
                        nextService = a;
                    }
                    if (rid === a.assoc.rid) {
                        prevService = a;
                    }
                }
            }
        }

        // The destinations
        let rows = [];

        if (prevService) {
            const main = prevService.main,
                origin = main.origin,
                prev = <span className="ldb-info">
                Formed by <Location data={data}
                                    tiploc={origin.falseDestination ? origin.falseDestination : origin.tiploc}/> <Via
                    via={via[main.rid]}/> service
            </span>;
            rows.push(<Movement key='rps'
                                data={data}
                                row={prevService.main.destination}
                                lid='-1'
                                ref='rps'
                                previousService={prev}
                                platform='due'
            />);
        }

        rows = Schedule.appendRows(rows, service, splits, data);

        if (joins) {
            rows.push(<tr key={'rj'}>
                <td className="ldb-fsct-stat"></td>
                <td className="ldb-fsct-loc-expt" colSpan="4">
                    <span className="ldb-info">
                    Joins the <Location data={data} tiploc={joins.main.origin.tiploc}
                    /> to <Location data={data} tiploc={joins.main.destination.tiploc}/> <Via
                        via={via[joins.main.rid]}/> service arriving at
                    </span>
                </td>
            </tr>);

            rows.push(<Movement key={'rjd'} data={data} row={joins.main.destination} lid='-1' ref={'rjd'}/>);

        }

        if (splits) {
            rows.push(<tr key={'ra'}>
                <td className="ldb-fsct-stat"></td>
                <td className="ldb-fsct-loc-expt" colSpan="4">
                    <span className="ldb-info">
                    <Location data={data} tiploc={splits.assoc.destination.tiploc}/> <Via via={via[splits.assoc.rid]}/> service runs from
                    </span>
                </td>
            </tr>);

            rows = Schedule.appendRows(rows, splits.schedule, null, data);
        }

        if (nextService) {
            const assoc = nextService.assoc,
                origin = assoc.destination,
                next = <span className="ldb-info">
                Forms the <Location data={data}
                                    tiploc={origin.falseDestination ? origin.falseDestination : origin.tiploc}/> <Via
                    via={via[assoc.rid]}/> service
            </span>;
            rows.push(<Movement key='rns'
                                data={data}
                                row={nextService.assoc.origin}
                                lid='-1'
                                ref='rns'
                                previousService={next}
                                platform='departs'
            />);

            rows.push(<Movement key='rnsd'
                                data={data}
                                row={nextService.assoc.destination}
                                lid='-1'
                                ref='rnsd'
                                platform='due'
            />);

        }

        return (<div id="board">
            <h3>
                <Time time={data.origin.time}/> <Location data={data} tiploc={data.origin.tiploc}/> to {dest}
            </h3>
            {terminated}
            <Reason data={data} reason={service.cancelReason} canc={true}/>
            <Reason data={data} reason={service.lateReason}/>

            <div className="ldbWrapper">
                <div className="ldb-row">
                    <table>
                        <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>Location</th>
                            <th>Plat</th>
                            <th>Time</th>
                            <th>Delay</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
    }

    static appendRows(rows, service, splits, data) {

        const lastReport = service.lastReport,
            lid = lastReport ? lastReport.id : -1,
            via = data.via ? data.via : {};

        let filter;
        if (config.get("showAll")) {
            filter = row => true;
        }
        if (!filter && config.get("showPasses")) {
            filter = row => {
                if (row.timetable.wtp || row.forecast.pass) {
                    return data.tiploc && data.tiploc[row.tiploc] && data.tiploc[row.tiploc].station
                }
                return true;
            };
        }
        if (!filter) {
            filter = row => row.id === lid || (lid >= 0 && !(lastReport && lastReport.wtp) && (lid + 1) === row.id) || !(row.timetable.wtp || row.forecast.pass);
        }

        for (let row of service.locations) {
            const key = 'r' + service.rid + '_' + row.id;
            if (filter(row)) {
                rows.push(<Movement
                    key={key}
                    data={data}
                    row={row}
                    lid={lid}
                    ref={key}
                />);

                if (splits && row.tiploc === splits.tiploc) {
                    rows.push(<tr key={key + "s"}>
                        <td className="ldb-fsct-stat"></td>
                        <td className="ldb-fsct-loc-expt" colSpan="4">
                            <span className="ldb-info">Where the train divides.</span>
                        </td>
                    </tr>);

                    rows.push(<tr key={key + "m"}>
                        <td className="ldb-fsct-stat"></td>
                        <td className="ldb-fsct-loc-expt" colSpan="4">
                            <span className="ldb-info">
                            <Location data={data} tiploc={data.destination.tiploc}/> <Via via={via[service.rid]}/> continues to
                            </span>
                        </td>
                    </tr>);
                }

                // Add a blank row when between stops with no passes
                if (row.id === lid && !(row.forecast.arrived && !row.forecast.departed)) {
                    let approaching;

                    if ((row.id + 1) < service.locations.length) {
                        let l = service.locations[row.id + 1],
                            f = l.forecast;
                        if (f && f.approaching) {
                            approaching = <td className="ldb-fsct-loc-expt" colSpan="4">
                                <span className="ldb-info">Approaching</span>
                            </td>
                        }
                    }

                    rows.push(<tr key={key + "a"}>
                        <td className="ldb-fsct-stat">
                            <FontAwesomeIcon icon={faTrain}/>
                            {approaching}
                        </td>
                    </tr>);
                }
            }
        }
        return rows
    }
}

export default Schedule;
