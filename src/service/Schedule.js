import React, { Component } from 'react';
import {PageHeader, Tab, Tabs} from 'react-bootstrap';
import Location from './Location.js';
import Time from './Time.js';

class Schedule extends Component {

  render() {
    const data = this.props.service;
    console.log( "Schedule", data );

    var via = "{via}";

    return (<div id="board">
      <h3>
        <Time time={data.origin.time}/> <Location data={data} tiploc={data.origin.tiploc}/> to <Location data={data} tiploc={data.destination.tiploc}/> {via}
      </h3>

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
            </tbody>
          </table>
        </div>
      </div>
    </div>);
  }
}
export default Schedule;
