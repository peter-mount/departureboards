import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { PageHeader } from 'react-bootstrap';
import EUCookie from 'area51-eucookie';

import BoardRow from './BoardRow.js';
import ManagedBy from './ManagedBy.js';
import MessageRow from './MessageRow.js';

//import Stomp from 'stompjs';

/*
* Main class that handles the display of a stations departure board
*/
class Boards extends Component {

  constructor(props) {
    super(props);
    this.state = {
      departures: null
    };
  }

  resetTimer( crs ) {
    const t=this;
    clearTimeout(t.timer);
    t.timer = setTimeout( ()=>t.refresh( crs ), 10000 );
  }

  // Retrieve the latest board
  refresh( crs ) {
    const t = this;
    t.resetTimer( crs )
    fetch( 'http://loge.amsterdam.area51.onl:9888/ldb/boards/' + crs + '?'+new Date())
      .then( res => res.json() )
      .then( departures => t.setState( { departures: departures } ) )
      .catch( e => {
        console.error( e );
      } );
  }

  // Render the departure boards
  renderDepartures( crs, data ) {
    var messages = null, rows = null, idx = 0

    if (data.messages) {
      messages = data.messages
              .filter(msg=>!msg.suppress)
              .map((msg, ind) => {
                  idx++;
                  return  <MessageRow
                              key={'row' + idx}
                              board={this}
                              index={idx}
                              msg={msg}
                          />;
              });
    }

    if (data.departures) {
      rows = data.departures
        // Filter out terminations
        .filter( d => !(data.tiploc[d.destination] && data.tiploc[d.destination].crs === crs) )
        // Filter out suppressed entries
        .filter( d => !(d.location && d.location.forecast && d.location.forecast.plat && (d.location.forecast.plat.sup || d.location.forecast.plat.cissup) ) )
        .map( (d,ind) => {
          idx++
          return  <BoardRow
                      key={d.rid}
                      board={this}
                      index={idx}
                      departure={d}
                      data={data}
                      crs={crs}
                  />;
        })
    }
    return <div>{messages}{rows}</div>;
  }

  render() {
    const { match, history } = this.props,
      { params } = match,
      crs = params.crs;

    var body, { departures } = this.state;

    if (departures) {
      body = this.renderDepartures( crs, departures );
    } else {
      this.refresh( crs );
      body = (<div>
        <i className="fa fa-spinner fa-pulse fa-3x fa-fw" />
        <span className="sr-only">Loading...</span>
      </div>);
    }

    var loc = departures ? departures.tiploc[ departures.station[ 0 ] ] : null,
      locName = loc ? loc.locname : crs;

    return (<div>
      <EUCookie />
      <div className="App-header">
        <h2>{locName}</h2>
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
        {body}
        <ManagedBy data={departures}/>
      </div>
    </div>);
  }
}

export default withRouter( Boards );
