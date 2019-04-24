import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Movement from './Movement.js';
import config from 'react-global-configuration';

import Location from '../util/Location.js';
import Reason from '../util/Reason.js';
import Time from '../util/Time.js';
import Via from '../util/Via.js';

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
        const data = this.props.service, lastReport = data.lastReport;
        if (lastReport) {
            let dom = ReactDOM.findDOMNode(this.refs['r' + lastReport.id]);
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
        const data = this.props.service, service = data.service;

        const lid = data.lastReport ? data.lastReport.id : -1;

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
            filter = row => row.id === lid || (lid >= 0 && !(data.lastReport && data.lastReport.wtp) && (lid + 1) === row.id) || !(row.timetable.wtp || row.forecast.pass);
        }

        let terminated;
        if (service && service.destinationLocation && service.terminatedAt && service.destinationLocation.tiploc !== service.terminatedAt.tiploc) {
            let t = service.terminatedAt.displaytime.split(':');
            terminated = <div>This service was terminated at <Location data={data}
                                                                       tiploc={service.terminatedAt.tiploc}/> at {t[0]}:{t[1]}
            </div>
        }

        return (<div id="board">
            <h3>
                <Time time={data.origin.time}/> <Location data={data} tiploc={data.origin.tiploc}/> to <Location
                data={data} tiploc={data.destination.tiploc}/>
                <Via via={data.via}/>
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
                        {service.locations
                        // Filter out passes unless we have just passed or approaching one
                            .filter(filter)
                            .reduce((a, row) => {
                                a.push(<Movement
                                    key={'r' + row.id}
                                    data={data}
                                    row={row}
                                    lid={lid}
                                    ref={'r' + row.id}
                                />);
                                // Add a blank row when between stops with no passes
                                if (row.id === lid && !(row.forecast.arrived && !row.forecast.departed)) {
                                    a.push(<tr key={'r' + row.id + "a"}>
                                        <td className="ldb-fsct-stat">
                                            <i className="fa fa-train" aria-hidden="true"></i>
                                        </td>
                                    </tr>);
                                }
                                return a;
                            }, [])
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>);
    }
}

export default Schedule;
