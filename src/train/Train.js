import React, { Component } from 'react';

import Delay from './Delay.js';
import Info from './Info.js';
import Location from './Location.js';
import Movement from './Movement.js';
import Time from './Time.js';

import Stomp from 'stompjs';

class Train extends Component {

    state = {
        hide: true,
        data: null,
        update: false
    };

    componentWillMount() {
      this.props.app.setPath(this.props.rid);

      // Get the global data in the background
      this.refresh(this);

      // Subscribe to websocket
      this.stopWSReconnect=false;
      this.connectWebSocket(this);
    }

    componentWillUnmount() {
        if(this.timer) clearTimeout(this.timer);

        this.stopWSReconnect=true;
        this.disconnectWebSocket(this);
    }

    connectWebSocket(t) {
      // Do nothing if not enabled etc
      if(!t.props.app.config.network.websocket.enabled || t.stopWSReconnect || t.wsclient)
        return;

      t.wsclient = Stomp.client('wss://ws.area51.onl/ws/');
      t.wsclient.debug = ()=>{};
      t.wsclient.connect('public','guest',
        ()=>{
          // Subscribe to the train
          t.sub1=t.wsclient.subscribe('/topic/darwin.'+this.props.rid+'.#', (msg)=>{
              t.refresh(t);
          });

          // Refresh now?
          t.updatePage(t);
        },
        (error)=>{
          t.disconnectWebSocket(t);

          // Reconnect?
          if(!t.stopWSReconnect)
              setTimeout(()=>t.connectWebSocket(t),t.props.app.config.network.websocket.reconnect);

          // Refresh now?
          t.updatePage(t);
        },
        '/');
    }

    disconnectWebSocket(t) {
        try {
            if(t.wsclient)
                t.wsclient.disconnect();
        }catch(e){
            console.error(e);
        }finally {
            t.wsclient=null;
        }
    }

    updateJson(t,json) {
        t.setState({
            hide: false,//true
            data: json,
            update: false
        });
    }

    updatePage(t) {
        t.setState({
            hide: false,//true
            data: t.state.data,
            update: true
        });
    }

    resetTimer(t) {
        if(t.timer) clearTimeout(t.timer);
        t.timer = setTimeout(() => t.refresh(t), t.props.app.config.network.refreshRate);
    }

    refresh(t,force) {
        // Don't update if too quick
        var now = new Date().getTime();
        //if(!force || (this.lastUpdate && (now-this.lastUpdate)<10000) )
        //  return ;

        this.lastUpdate=now;

        t.resetTimer(t);

        fetch('https://api.area51.onl/rail/2/darwin/rtt/' + t.props.rid)
                .then(res => res.json())
                .then(json => {
                  // add cancel flag to movement if we can match it in the timetable
                  if(json.movement && json.timetable)
                    json.timetable.filter(t=>t.can)
                      .forEach(t=> {
                        json.movement.filter( m => m.tpl===t.tpl && (t.wtd?t.wtd:t.wta?t.wta:t.wtp) === (m.wtd?m.wtd:m.wta?m.wta:m.wtp) )
                          .forEach( m => m.can = t.can );
                      });
                  return json;
                })
                .then(json => {
                    t.resetTimer(t);
                    t.updateJson(t,json);
                })
                .catch(e => {
                    t.resetTimer(t);
                    t.updatePage(t);
                });
    }

    render() {
        var data = this.state.data;
        if (this.state.hide || !data )
            return <div>
                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                <span className="sr-only">Loading...</span>
            </div>;

        var via;
        if(data.via)
          via = <div className='ldbVia'>{data.via}</div>;

        var schedule = data.schedule ? data.schedule : {};
        var forecast = data.forecast ? data.forecast : {};

        // Id of last report
        var lrid = data.lastReport ? data.lastReport.id : -1;

        return <div id="board">
            <div className="App-header">
              <h3>
                <Time time={data.origin.time}/> <Location data={data} tiploc={data.origin.tpl}/> to <Location data={data} tiploc={data.destination.tpl}/> {via}
              </h3>
            </div>

            <Info className="ldbCancelled" value={data.schedule && data.schedule.cancReason}/>
            <Info className="ldbLate" value={data.forecast && data.forecast.lateReason}/>

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
                            {data.movement
                                ? data.movement
                                // We don't show passes unless:
                                // We are the last report
                                // We are the next entry after the last report if it was not also a pass - no 2 passes together
                                //.filter(row => lrid===row.id || (lrid>=0 && !data.lastReport.wtp && (lrid+1)===row.id) || !(row.pass || row.wtp))
                                .filter(row => lrid===row.id || (lrid>=0  && (lrid+1)===row.id) || !(row.pass || row.wtp))
                                .reduce((a, row) => {
                                  a.push(<Movement key={'r'+row.id} data={data} row={row} lrid={lrid}/>);
                                  // Add a blank row when between stops with no passes
                                  //if(row.id===lrid && !(row.wtp||(row.arr&&!row.dep)))
                                  if(row.id===lrid && !(row.arr && !row.dep))
                                    a.push( <tr key={'r'+row.id+"a"}>
                                              <td className="ldb-fsct-stat">
                                                <i className="fa fa-train" aria-hidden="true"></i>
                                              </td>
                                            </tr>);
                                  return a;
                                },[])
                                :null
                        }
                        </tbody>
                    </table>
                </div>

            <Info label="Last Report" value={data.lastReport && forecast.activated && !forecast.deactivated
                                ? [
                                    // What happened
                                    data.lastReport.pass ? 'Passing ' : data.lastReport.dep ? 'Departing ' : data.lastReport.arr ? 'Stopped at ' : null,
                                    // Where
                                    <Location key='lrl' data={data} tiploc={data.lastReport.tpl}/>,
                                    // When
                                    ' at ', <Time key='lrt' time={data.lastReport.actualTime}/>,
                                    // Delay
                                    ' ', <Delay key='lrd' delay={data.lastReport.delay} full="true"/>
                                ]
                                : null
            }/>

                <Info label="Operator" value={schedule.toc ? schedule.toc.name : null}/>
                <Info label="Head code" value={schedule.trainId}/>
                <Info label="UID" value={schedule.uid}/>
                <Info label="RID" value={data.rid} linkPrefix="//uktra.in/rtt/train/"/>
                <Info label="Generated" value={data.generatedTime?data.generatedTime.split('.')[0]:null}/>
                <Info label="Updates" value={this.wsclient?'Automatic':'Every minute'}/>
            </div>
        </div>;
            }

        }

        export default Train;
