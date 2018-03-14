import React, { Component } from 'react';
import {PageHeader, Tab, Tabs} from 'react-bootstrap';
import Movement from './Movement.js';

import Delay from '../util/Delay.js';
import Location from '../util/Location.js';
import Reason from '../util/Reason.js';
import Time from '../util/Time.js';
import Via from '../util/Via.js';

class Schedule extends Component {

  render() {
    const data = this.props.service, service = data.service;
    console.log( "Schedule", data );

    var id=0, lid=0;

    return (<div id="board">
      <h3>
        <Time time={data.origin.time}/> <Location data={data} tiploc={data.origin.tiploc}/> to <Location data={data} tiploc={data.destination.tiploc}/>
      </h3>
      <Via via={data.via}/>
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
              // We don't show passes unless:
              // We are the last report
              // We are the next entry after the last report if it was not also a pass - no 2 passes together
              //.filter(row => lrid===row.id || (lrid>=0 && !data.lastReport.wtp && (lrid+1)===row.id) || !(row.pass || row.wtp))
              //.filter(row => lrid===row.id || (lrid>=0  && (lrid+1)===row.id) || !(row.pass || row.wtp))
              .reduce( (a, row) => {
                a.push( <Movement key={'r'+id} data={data} row={row} lid={lid} rid={id}/> );
                id++;
                return a;
              },[])
            }
            </tbody>
          </table>
        </div>
      </div>
    </div>);
  }
}
export default Schedule;
