import React, { Component } from 'react';
import { withRouter } from 'react-router';
import config from 'react-global-configuration';

function tiploc( d, tpl ) {
  return d.tiploc[ tpl ] ? d.tiploc[ tpl ].locname : tpl
}

// Used to fix calling point names so they don't break
function fix1(s,a,b) {
  while(s.indexOf(a)>=0)
  s=s.replace(a,b);
  return s;
}

function fix(s) {
  return fix1(s,' ','&nbsp;');
}

function fixtime( t ) {
  if (t) {
    var a = t.split(':')
    return a[0]+':'+a[1]
  }
  return null
}

function reason(cancelled,reason,data) {
  var m;
  if (data.reasons) {
    if (cancelled && data.reasons.cancelled) {
      m = data.reasons.cancelled[reason.reason];
    } else if (!cancelled && data.reasons.late) {
      m = data.reasons.late[reason.reason];
    }
    m = m ? m.reasontext : ("reason " + reason.reason)
  }
  if (reason.tiploc) {
    m = m + ( reason.near ? ' near ' : ' at ') + tiploc( data, reason.tiploc )
  }
  return m
}

/*
 * A row on the board showing current status of a train
 */
class BoardRow extends Component {

  showBoard( tpl ) {
    var data = this.props.data;
    if (data.tiploc && data.tiploc[ tpl ] && data.tiploc[ tpl ].crs) {
      var crs = data.tiploc[ tpl ].crs;
      return () => {
        this.props.history.push('/departures/' + crs );
      };
    }
    return () => {}
  }

  render() {
    var history = this.props.history;
    var data = this.props.data,
        train = this.props.departure,
        loc = train.location,
        timetable = loc.timetable,
        forecast = loc.forecast,
        plat = forecast ? forecast.plat : null,
        time = timetable ? timetable.time : null,
        // destination text
        destination = tiploc( data, train.destination ),
        // Train's been cancelled at this location
        cancelled = loc.cancelled,
        // train terminates here
        terminatesHere = data.tiploc[ train.destination ] && data.tiploc[ train.destination ].crs === this.props.crs;

    if (terminatesHere) {
      destination = 'Terminates Here';
    }

    var message, via, calling, delay, toc, length, lastReport;

    if (data.via && data.via[ train.rid ]) {
      via = <div className="ldb-entbot">{data.via[train.rid].text}</div>
    }

    var expected = 'On Time', expectedClass='ldbOntime';
    if(loc.cancelled) {
      expected = 'Cancelled';
      expectedClass = 'ldbCancelled';
    } else if (forecast && forecast.arrived)
      expected = 'Arrived';
    else if (forecast && forecast.departed)
      expected = 'Departed';
    else if (forecast && forecast.delayed) {
      expected = 'Delayed';
      expectedClass = 'ldbLate';
    } else if (loc.delay > 0) {
      // forecast will not be null here as this is calculated from it
      expected = fixtime(forecast.time);
      expectedClass = 'ldbLate';
    }

    if (train.lastReport) {
      lastReport = <span>
        <span>Last report:</span>
        <span className="ldbDest"> {tiploc(data,train.lastReport.tpl)} {fixtime(train.lastReport.time)} </span>
      </span>;
    }

    var toc = train.toc && data.toc && data.toc[train.toc] ? <span> {data.toc[train.toc].tocname}&nbsp;service. </span> : null;

    var length = !cancelled && forecast && forecast.length>0 ?
            <span>
              <span>Formed of:</span>
              <span className="ldbDest"> {forecast.length} coaches</span>
            </span>
            : null;

    if ( cancelled && train.cancelReason && train.cancelReason.reason > 0 ) {
      message = <div className="ldb-entbot">
        <div className="ldbCancelled">{reason(true,train.cancelReason, data)}</div>
      </div>;
    } else if ( train.lateReason && train.lateReason.reason > 0) {
      message = <div className="ldb-entbot">
        <div className="ldbLate">{reason(false,train.lateReason, data)}</div>
      </div>;
    }

    if (train.calling && train.calling.length > 0 && !config.get( "hideCalling" ) ) {
      calling = <div className="ldb-entbot">
        <span className="callList" > Calling at:</span> {
          train.calling.map(
            cp => <span key={cp.tpl} className="callList" ><a onClick={this.showBoard(cp.tpl)}>{tiploc(data,cp.tpl)}</a>&nbsp;({fixtime(cp.time)}) </span>
        )}
      </div>;
    }

    if ( !cancelled && loc.delay && Math.abs( loc.delay ) >= 60 ) {
      var m = Math.floor( Math.abs( loc.delay / 60 ) ), s = Math.abs( loc.delay % 60 );
      delay = <div className="ldb-entbot">
        <div className="ldbLate">This train is running {m} {m>1?"minutes":"minute"}{s?" "+s+"s":""} {loc.delay>0?"late":"early"}</div>
      </div>;
    }

    return  <div className={this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row"}>
              <div className="ldb-enttop">
                <div className={"ldbCol ldbForecast "+expectedClass}>{expected}</div>
                <div className={"ldbCol ldbSched"}>{fixtime(time)}</div>
                <div className="ldbCol ldbPlat">{plat && !plat.suppressed && !plat.cisSuppressed ? plat.plat : null}</div>
                <div className="ldbCont">
                  <a onClick={()=>this.props.history.push('/service/' + train.rid )}>{destination}</a>
                </div>
              </div>
              {via}
              {message}
              {calling}
              {delay}
              <div className="ldb-entbot">{toc}{length}{lastReport}</div>
            </div>;
  }
};

export default withRouter(BoardRow);
