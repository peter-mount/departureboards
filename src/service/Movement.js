import React, { Component } from 'react';

import Delay from './Delay.js';
import Location from './Location.js';
import Time from './Time.js';

class Movement extends Component {
  render() {
    const p = this.props,
      row = p.row,
      data = p.data,
      rid = p.rid,
      lid = p.lid,
      wtp = row.timetable.wtp,
      forecast = row.forecast,
      plat = forecast.plat;
    var c1 = 'expt', c2=c1;
    /*
    if(row.can) {
        c1= 'can';
        c2= 'cancelled';
    }
    else if(row.wtp)
        c1=c2= 'pass';
    else if(row.dep || row.arr) {
        c1= 'arr';
        c2= 'arrived';
    }
    */

console.log(row.tiploc, wtp, plat, row )
    // Show icon only if we are the last id
    //var icon = lrid===row.id && !row.dep ?<i className="fa fa-train" aria-hidden="true"></i>:null;
    var icon = lid===rid && (forecast.arrived && !forecast.departed) ?<i className="fa fa-train" aria-hidden="true"></i>:null;

    return  <tr key={'r'+row.id}>
              <td className="ldb-fsct-stat">{icon}</td>
              <td className={'ldb-fsct-loc-' + c1}>
                <Location data={data} tiploc={row.tiploc}/>
              </td>
              <td className={'ldb-fsct-plat-' + c1}>
                { row.can ? 'Cancelled' : wtp ? 'Pass' : plat && (plat.suppressed && !forecast.departed) ? null : plat.plat}
              </td>
              <td className={'ldb-fsct-' + c2}>
                <Time time={forecast.time} arrived={forecast.arrived && !forecast.departed} expected={!(forecast.arrived || forecast.departed)}/>
              </td>
              <td className={'ldb-fsct-' + c2}>
                <Delay delay={row.delay}/>
              </td>
            </tr>;

  }
};

export default Movement;
