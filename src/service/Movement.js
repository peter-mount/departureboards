import React, {Component} from 'react';

import Delay from '../util/Delay.js';
import Location from '../util/Location.js';
import Time from '../util/Time.js';

class Movement extends Component {
    render() {
        const p = this.props,
            previousService = p.previousService,
            row = p.row,
            data = p.data,
            service = data.service,
            lid = p.lid,
            wtp = row.timetable.wtp,
            forecast = row.forecast,
            plat = forecast.plat;

        let c1 = 'expt', c2 = c1;
        if (row.cancelled) {
            c1 = 'can';
            c2 = 'cancelled';
        } else if (wtp)
            c1 = c2 = 'pass';
        else if (forecast.departed || forecast.arrived) {
            c1 = 'arr';
            c2 = 'arrived';
        }

        // Show train icon if we are at the required position
        let icon = lid === row.id && !forecast.departed ? <i className="fa fa-train" aria-hidden="true"></i> : null;

        let terminated = row.planned && row.planned.activity === 'TF' && service && service.destinationLocation && service.terminatedAt && service.destinationLocation.tiploc !== service.terminatedAt.tiploc,
            arrived = forecast.arrived && !forecast.departed,
            expected = !(forecast.arrived || forecast.departed),
            cancelled = row.cancelled,

            delay = cancelled ? "" : <Delay delay={row.delay}/>,

            loc = previousService ? previousService : <Location data={data} tiploc={row.tiploc}/>,

            platform = p.platform ? <span className="ldb-info">{p.platform}</span>
                : cancelled ? 'Cancelled'
                    : wtp ? 'Pass'
                        : terminated ? 'Terminated'
                            : plat && (plat.suppressed && !forecast.departed) ?
                                null :
                                plat.plat;

        return <tr key={'r' + row.id}>
            <td className="ldb-fsct-stat">{icon}</td>
            <td className={'ldb-fsct-loc-' + c1}>{loc}</td>
            <td className={'ldb-fsct-plat-' + c1}>{platform}</td>
            <td className={'ldb-fsct-' + c2}>
                <Time time={forecast.time} terminated={terminated} arrived={arrived} expected={expected}/>
            </td>
            <td className={'ldb-fsct-' + c2}>{delay}</td>
        </tr>;

    }
}

export default Movement;
