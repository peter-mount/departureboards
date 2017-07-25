import React, { Component } from 'react';

import BoardRow from './BoardRow.js';
import ManagedBy from './ManagedBy.js';
import MessageRow from './MessageRow.js';

import Stomp from 'stompjs';

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
      this.props.app.setPath(this.props.station.location.crs);

      // Load the board a fresh
      this.refresh(this);

      // Subscribe to websocket
      this.stopWSReconnect=false;
      this.subscribe();
    }

    componentWillUnmount() {
      clearTimeout(this.timer);

      this.stopWSReconnect=true;
      this.unsubscribe();
    }

    subscribe() {
      var t = this;
      t.unsubscribe();

      // Do nothing if not enabled etc
      if(!t.props.app.config.network.websocket.enabled || t.stopWSReconnect)
        return;

      t.wsclient = Stomp.client('wss://ws.area51.onl/ws/');
      t.wsclient.debug = ()=>{};
      t.wsclient.connect('public','guest',
        ()=>{
          t.sub1=t.wsclient.subscribe('/topic/darwin.station.'+t.props.station.location.crs, (msg)=>{
            msg = JSON.parse(msg.body);
            //console.log(msg);
            t.update(t,msg);
            //t.refresh(t);
          });
        },
        (error)=>{
          console.error('Websocket error',error);
          t.unsubscribe();

          // Reconnect?
          if(!t.stopWSReconnect)
              setTimeout(()=>t.connectWebSocket(t),t.props.app.config.network.websocket.reconnect);
        },
        '/');
    }

    unsubscribe() {
      try {
        if(this.wsclient) {
            this.wsclient.disconnect();
        }
      } catch(e) {
        console.error(e);
      } finally {
        this.wsclient=null;
      }
    }

    update(t,m) {
      if(t.state.data && t.state.data.rid) {
        //console.log('Check',m.rid);
        var d=t.state.data,
            tr = d.rid[m.rid];
        if(tr) {
          // Remove?
          if(m.terminated || m.dep.at || m.pass.at) {
            //console.log('Remove',m.rid);
            d.departures=d.departures.filter(d=>d.train.rid!==m.rid);
          }
          else {
            //console.log('Update',m.rid);

            tr.status.arrive = m.arr.at?m.arr.at:m.arr.et;
            tr.status.arrived = m.arr.at!==null;

            tr.status.depart = m.dep.at?m.dep.at:m.dep.et;
            tr.status.platform = m.ldb.plat;

            var tm = m.ldb.time.split(':');
            tr.status.time = tm[0]+':'+tm[1];

            tr.status.delay = t.getTime(m.ldb.delay);
            tr.status.delayed = m.ldb.delayed===true;
          }

          tr.test=true;

          t.sort(d,t);

          t.setState({
            data: d,
            rid: m.rid
          });

          //t.resetTimer(t);

          return;
        } else {
          //console.log('ignore',m.rid);
          return;
        }
      }

      //console.log("Unkown, refresh");
      t.refresh(t);
    }

    getTime(d) {
      var dl=d.split(':');
      return (Number.parseInt(dl[0],10)*60)+Number.parseInt(dl[1],10);
    }

    sort(d,t) {
      if(d && d.departures)
        try {
          d.departures = d.departures.sort( (a,b) => {
            var r = t.getTime(a.status.time) - t.getTime(b.status.time);

            // Same time, then just go by rid to keep some sort of order
            if(!r)
              r = a.train.rid - b.train.rid;

            return r;
          });
        }catch(e) {
          console.error(e);
        }
    }

    resetTimer(t) {
      clearTimeout(t.timer);
      t.timer = setTimeout( ()=>t.refresh(t), t.props.app.config.network.refreshRate );
    }

    refresh(t) {
        // Stop us refreshing too often, mainly for busy stations
        var now = new Date().getTime();
        if( !t.lastUpdate || (now-t.lastUpdate)>=10000) {
          t.resetTimer(t);
          //console.log('refresh');
          fetch('https://api.area51.onl/rail/2/station/' + t.props.station.location.crs + '/boards')
                .then(res => res.json())
                .then(json => {

                  // Map of entries by rid
                  json.rid = json.departures.reduce( (a,b) => {
                    a[b.train.rid]=b;
                    return a;
                  },{});

                  t.sort(json,t);

                  t.setState({data: json});
                })
                .catch(e => {
                    // Set retry for another 60s from now
                    clearTimeout(t.timer);
                    t.timer = setTimeout(() => t.refresh(t), t.props.app.config.refreshRate);
                });
      }
      t.lastUpdate=now;
    }

    render() {

      // If crs changed from another board then force refresh
      if(this.lastCrs && this.lastCrs!==this.props.station.location.crs) {
        this.lastCrs=this.props.station.location.crs;
        this.subscribe();
        this.refresh(this);
      }

        var departures = null, messages = null, idx = 0, data=this.state.data;

        //console.log(data);

        if (data.messages && data.messages.length > 0)
            messages = data.messages
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

        if (data.departures && data.departures.length > 0)
            departures = data.departures
                    .filter(dep => !dep.status.terminatesHere || this.props.app.config.boards.services.terminated )
                    .map((dep, ind) => {
                        idx++;
                        return  <BoardRow
                                    key={dep.train.rid}
                                    app={this.props.app}
                                    board={this}
                                    index={idx}
                                    departure={dep}
                                    station={data.station}
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
                    <h2>{this.props.station.location.name}</h2>
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
                    <ManagedBy operator={this.props.station.operator}/>
                  </div>
                </div>;
    }
}

export default Boards;
