import React, { Component } from 'react';

import Delay from './Delay.js';
import Location from './Location.js';
import Time from './Time.js';

class Movement extends Component {
    render() {
        var row = this.props.row;
        var data = this.props.data;
        var lrid = this.props.lrid;
        var c1 = 'expt', c2=c1;
        console.log(row);
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

        // Show icon only if we are the last id
        //var icon = lrid===row.id && !row.dep ?<i className="fa fa-train" aria-hidden="true"></i>:null;
        var icon = lrid===row.id && (row.arr && !row.dep) ?<i className="fa fa-train" aria-hidden="true"></i>:null;

        return  <tr key={'r'+row.id}>
                  <td className="ldb-fsct-stat">{icon}</td>
                  <td className={'ldb-fsct-loc-' + c1}>
                    <Location data={data} tiploc={row.tpl}/>
                  </td>
                  <td className={'ldb-fsct-plat-' + c1}>
                    {row.can?'Cancelled':row.wtp?'Pass':row.platsup ? null : row.plat}
                  </td>
                  <td className={'ldb-fsct-' + c2}>
                    {row.dep ? <Time time={row.dep}/> : row.arr ? <Time time={row.arr} arrived="true"/> : <Time time={row.expectedTime} expected="true"/>}
                  </td>
                  <td className={'ldb-fsct-' + c2}>
                    <Delay delay={row.delay}/>
                  </td>
                </tr>;

    }
};

export default Movement;
