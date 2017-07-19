import React, { Component } from 'react';

import Stomp from 'stompjs';

/*
 * Handles the display of an informational message from Darwin
 */
class MessageRow extends Component {

    render() {
        var msg=this.props.msg, icon = 'fa-warning';

        if(msg.category === 'System')
            icon = 'fa-linux';
        else if(msg.category === 'Information'||msg.category === 'PriorTrains'||msg.category === 'PriorOther')
            icon = 'fa-info-circle';

        return (
                <div className={"ldb-enttop ldb-message " + (this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row")}>
                    <i className={"fa " + icon + ' fa-3x'} aria-hidden="true"></i>
                    <span dangerouslySetInnerHTML={{__html: msg.message}}></span>
                    <div className="clearfix"></div>
                </div>
                );
    }
};

/*
 * Handles the display of a departure showing the trains state, platform,
 * calling points etc
 */
class BoardRow extends Component {
    render() {
        var train = this.props.departure.train,
                status = this.props.departure.status,
                sched = this.props.departure.schedule;

        var departs = sched.ptd, destination = train.dest;
        if (status.terminatesHere) {
            destination = 'Terminates Here';
        }

        var expected = 'On Time';
        if (status.arrived)
            expected = 'Arrived';
        else if (status.departed)
            expected = 'Departed';
        else if (status.delayed)
            expected = 'Delayed';
        else if (status.delay > 0)
            expected = status.time;

        var lastReport = status.lastReport ?
                [
                    <span >Last report:</span>,
                    <span className="ldbDest"> {status.lastReport.name} {status.lastReport.time} </span>
                ]
                : null;

        var toc = train.toc ? <span> {train.toc}&nbsp;service. </span> : null;
        var length = status.length && status.length>0 ?
                [
                    <span>Formed of:</span>,
                    <span className="ldbDest"> {status.length} coaches</span>
                ]
                : null;

        var message = null;
        if(status.cancelled || status.delayed)
            message = <div className="ldb-entbot">
                <div className="ldbCancelled">{status.reason}</div>
              </div>;
        else if(status.reason)
            message = <div className="ldb-entbot">
                <div className="ldbLate">{status.reason}</div>
              </div>;

        var calling = null;
        if (this.props.departure.calling && this.props.departure.calling.length > 0)
            calling = <div className="ldb-entbot">
                <span className="ldbHeader callList" > Calling at:</span>
                {
                    this.props.departure.calling.reduce((a, cp) => {
                        a.push(<span className="callList" ><a href={"?" + cp.crs}>{cp.name}</a> ({cp.time}) </span>);
                        return a;
                },[])}
            </div>;

            return (
                    <div className={this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row"}>
                        <div className="ldb-enttop">
                            <div className="ldbCol ldbForecast ldbOntime">{expected}</div>
                            <div className="ldbCol ldbSched">{departs}</div>
                            <div className="ldbCol ldbPlat">{status.platform}</div>
                            <div className="ldbCont">
                        <a href={"?" + train.rid}>{destination}</a>
                            </div>
                        </div>
                        {message}
                        {calling}
                        <div className="ldb-entbot">{toc}{length}{lastReport}</div>
                    </div>
                    );
    }
};

/*
 * Main class that handles the display of a stations departure board
 */
class Boards extends Component {

    state = {
        data: {
            departures: []
        }
    };

    componentWillMount() {
        //window.history.replaceState({},'','/?'+this.props.station.code);

        // Load the board a fresh
        this.refresh(this);

        // Subscribe to websocket
        var t = this;
        t.wsclient = Stomp.client('wss://ws.area51.onl/ws/');
        t.wsclient.debug = ()=>{};
        t.wsclient.connect('public','guest',()=>{
            t.sub1=t.wsclient.subscribe('/topic/darwin.station.'+t.props.station.code, (msg)=>{
                t.refresh(t);
            });
        },
        (error)=>{
            console.error('Websocket error',error);
            try {
                t.wsclient.disconnect();
            }catch(e){
                console.error(e);
            }finally {
                t.wsclient=null;
            }
        }, '/');
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
        if(this.wsclient) {
            this.wsclient.disconnect();
        }
        this.wsclient=null;
    }

    refresh(t) {
        // Stop us refreshing too often, mainly for busy stations
        var now = new Date().getTime();
        if( t.lastUpdate && (now-t.lastUpdate)<10000)
            return ;
        t.lastUpdate=now;

        clearTimeout(t.timer);
        t.timer = setTimeout( ()=>t.refresh(t), t.props.app.config.refreshRate );

        fetch('https://api.area51.onl/rail/2/station/' + t.props.station.code + '/boards')
                .then(res => res.json())
                .then(json => {
                    t.setState({data: json});
                })
                .catch(e => {
                    // Set retry for another 60s from now
                    clearTimeout(t.timer);
                    t.timer = setTimeout(() => t.refresh(t), t.props.app.config.refreshRate);
                });
    }

    render() {
        var departures = null, messages = null, idx = 0;

        if (this.state.data.messages && this.state.data.messages.length > 0)
            messages = this.state.data.messages
                    .filter(msg=>!msg.suppress)
                    .map((msg, ind) => {
                        idx++;
                        return  <MessageRow
                                    key={'row' + idx}
                                    app={this.props.app}
                                    board={this}
                                    index={idx}
                                    msg={msg}
                                />;
                    });

        if (this.state.data.departures && this.state.data.departures.length > 0)
            departures = this.state.data.departures
                    .filter(dep => !dep.status.terminatesHere)
                    .map((dep, ind) => {
                        idx++;
                        return  <BoardRow
                                    key={'row' + idx}
                                    app={this.props.app}
                                    board={this}
                                    index={idx}
                                    departure={dep}
                                />;
                    });

        if( messages===null && departures===null )
            messages =  <MessageRow
                            key={'row' + idx}
                            app={this.props.app}
                            board={this}
                            index={idx}
                            msg={{
                                category: 'Information',
                                message: 'No information is currently available for this station.',
                                suppress: false,
                                source: 'Local'
                            }}
                        />;

        return  <div>
                  <div className="App-header">
                    <h2>{this.props.station.name}</h2>
                    <div className="ldbWrapper">
                      <div className="ldbTable">
                        <div className="ldbHead">
                          <div className="ldbCol ldbForecast">Expected</div>
                          <div className="ldbCol ldbSched">Departs</div>
                          <div className="ldbCol ldbPlat">Plat</div>
                          <div className="ldbCont">Destination</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="App-intro">
                    {messages}
                    {departures}
                  </div>
                </div>;
    }
}

export default Boards;

//                        <div className="ldbRow altrow">
//                            <div className="ldb-enttop">
//                                <div className="ldbCol ldbForecast ldbOntime">On&nbsp;Time</div>
//                                <div className="ldbCol ldbSched"> 15:56 </div>
//                                <div className="ldbCol ldbPlat"> 2 </div>
//                                <div className="ldbCont"> <a > Ashford International </a>
//                                    <span className="ldbVia">via Maidstone East</span> </div>
//                            </div>
//                            <div className="ldb-entbot">
//                                <span className="ldbHeader callList" > Calling at: </span>
//                                <span className="callList" > <a href="/mldb/BSD">Bearsted</a> (16:02) </span>
//                                <span className="callList" > <a href="/mldb/HBN">Hollingbourne</a> (16:05) </span>
//                                <span className="callList" > <a href="/mldb/HRM">Harrietsham</a> (16:09) </span>
//                                <span className="callList" > <a href="/mldb/LEN">Lenham</a> (16:13) </span>
//                                <span className="callList" > <a href="/mldb/CHG">Charing</a> (16:18) </span>
//                                <span className="callList" > <a href="/mldb/AFK">Ashford&nbsp;International</a> (16:27) </span>
//                            </div>
//                            <div className="ldb-entbot">
//                                <span> Southeastern&nbsp;service. </span>
//                                <span className="ldbHeader">Last report:</span>
//                                <span className="ldbDest"> Barming 15:50 </span>
//                            </div>
//                        </div>
