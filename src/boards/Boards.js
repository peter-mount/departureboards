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
      this.subscribe();
    }

    componentWillUnmount() {
      clearTimeout(this.timer);
      this.unsubscribe();
    }

    subscribe() {
      var t = this;
      t.unsubscribe();
      t.wsclient = Stomp.client('wss://ws.area51.onl/ws/');
      t.wsclient.debug = ()=>{};
      t.wsclient.connect('public','guest',()=>{
          t.sub1=t.wsclient.subscribe('/topic/darwin.station.'+t.props.station.location.crs, (msg)=>{
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

    unsubscribe() {
      if(this.wsclient) {
          this.wsclient.disconnect();
      }
      this.wsclient=null;
    }

    refresh(t) {
        // Stop us refreshing too often, mainly for busy stations
        var now = new Date().getTime();
        if( !t.lastUpdate || (now-t.lastUpdate)>=10000) {
          clearTimeout(t.timer);
          t.timer = setTimeout( ()=>t.refresh(t), t.props.app.config.refreshRate );

          fetch('https://api.area51.onl/rail/2/station/' + t.props.station.location.crs + '/boards')
                .then(res => res.json())
                .then(json => t.setState({data: json}) )
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
                                    station={this.state.data.station}
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
