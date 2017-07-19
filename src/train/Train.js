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
        //window.history.replaceState({}, '', '?' + this.props.rid);

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
        console.log('con 1');
        if(t.stopWSReconnect || t.wsclient) return;

        console.log('con 2');
        t.wsclient = Stomp.client('wss://ws.area51.onl/ws/');
        t.wsclient.debug = ()=>{};
        t.wsclient.connect('public','guest',()=>{
        console.log('connected');
            // Subscribe to the train
            t.sub1=t.wsclient.subscribe('/topic/darwin.'+this.props.rid+'.#', (msg)=>{
                t.refresh(t);
            });

            // Refresh now?
            t.updatePage(t);
        },
        (error)=>{
            console.error('Websocket error',error);

            t.disconnectWebSocket(t);

            // Reconnect?
            if(!t.stopWSReconnect)
                setTimeout(()=>t.connectWebSocket(t),5000);

            // Refresh now?
            t.updatePage(t);
        }, '/');
    }

    disconnectWebSocket(t) {
        console.log('disc');
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
        t.timer = setTimeout(() => t.refresh(t), t.props.app.config.refreshRate);
    }

    refresh(t) {
        // Don't update if too quick
        var now = new Date().getTime();
        //if(this.lastUpdate && (now-this.lastUpdate)<10000)
        //    return ;

        this.lastUpdate=now;

        t.resetTimer(t);

        fetch('https://api.area51.onl/rail/2/darwin/rtt/' + t.props.rid)
                .then(res => res.json())
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
        console.log(this.state);
        var data = this.state.data;
        if (this.state.hide || !data )
            return <div>
                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                <span className="sr-only">Loading...</span>
            </div>;

        var schedule = data.schedule ? data.schedule : {};
        var forecast = data.forecast ? data.forecast : {};

        // Id of last report
        var lrid = data.lastReport ? data.lastReport.id : -1;

        return <div id="board">
            <div className="App-header">
                <Time time={data.origin.time}/> <Location data={data} tiploc={data.origin.tpl}/> to <Location data={data} tiploc={data.destination.tpl}/> <span className='ldbVia'>{data.via}</span> due <Time time={data.destination.time}/>
            </div>

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
                                    // Add the movement
                                    a.push(<Movement key={'r'+row.id} data={data} row={row} lrid={lrid}/>);
                                    // Add a blank row when between stops with no passes
                                    //if(row.id===lrid && !(row.wtp||(row.arr&&!row.dep)))
                                    if(row.id===lrid && !(row.arr && !row.dep))
                                        a.push(<tr key={'r'+row.id+"a"}>
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
                <div className="ldb-row">&nbsp;</div>
            </div>
        </div>;
            }

        }

        export default Train;
