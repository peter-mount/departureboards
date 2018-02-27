import React, { Component } from 'react';

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

function reason(reason,data) {
  var m;
  if (data.reasons) {
    if (reason.cancelled && data.reasons.cancelled) {
      m = data.reasons.cancelled[reason.reason];
    } else if (!reason.cancelled && data.reasons.late) {
      m = data.reasons.late[reason.reason];
    }
    m = m ? m.reasontext : ("reason " + reason.reason)
  }
  if (reason.tiploc) {
    m = m + ( reason.near ? ' near ' : ' at ') + tiploc( reason.tiploc )
  }
  return m
}

/*
 * A row on the board showing current status of a train
 */
class BoardRow extends Component {

  render() {
    var data = this.props.data,
        train = this.props.departure,
        loc = train.location,
        timetable = loc.timetable,
        forecast = loc.forecast,
        plat = forecast ? forecast.plat : null,
        time = timetable ? timetable.time : null,
        // destination text
        destination = tiploc( data, train.destination ),
        // via another station
        via = train.via ? <div className="ldb-entbot">{train.via}</div> : null,
        // train terminates here
        terminatesHere = data.tiploc[ train.destination ] && data.tiploc[ train.destination ].crs === this.props.crs;

    if (terminatesHere) {
      destination = 'Terminates Here';
    }

    var message = null, calling = null, delay, toc, length, lastReport;

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

    /*

    if( (status.cancelled && !this.props.app.config.boards.calling.cancelled)
    || ( status.terminatesHere && !this.props.app.config.boards.calling.terminated)
    || ( (!status.cancelled || status.terminatesHere) && !this.props.app.config.boards.calling.running)
    )
      srcCalling=null;

    var lastReport = status.lastReport ?
            <span>
              <span >Last report:</span>
              <span className="ldbDest"> {status.lastReport.name} {status.lastReport.time} </span>
            </span>
            : null;

    var toc = train.toc ? <span> {train.toc}&nbsp;service. </span> : null;
    var length = status.length && status.length>0 ?
            <span>
              <span>Formed of:</span>
              <span className="ldbDest"> {status.length} coaches</span>
            </span>
            : null;
    */

    if( loc.cancelled && train.cancelReason && train.cancelReason.reason > 0 )
        message = <div className="ldb-entbot">
                    <div className="ldbCancelled">{reason(train.cancelReason, data)}</div>
                  </div>;
    else if( train.lateReason && train.lateReason.reason > 0)
        message = <div className="ldb-entbot">
                    <div className="ldbLate">{reason(train.lateReason, data)}</div>
                  </div>;

    /*
    if (srcCalling && srcCalling.length > 0)
        calling = <div className="ldb-entbot">
                    <span className="callList" > Calling at:</span> {
                      this.props.departure.calling.map(
                        cp => <span key={cp.crs} className="callList" ><a onClick={()=>this.props.app.boards(cp.crs)} dangerouslySetInnerHTML={{__html: this.fix(cp.name)}}></a>&nbsp;({cp.time}) </span>
                    )}
                  </div>;
    */

    if (loc.delay&&Math.abs(loc.delay)>=60) {
      var m = Math.floor(Math.abs(loc.delay/60)), s = Math.abs(loc.delay % 60);
      delay = <div className="ldb-entbot">
                  <div className="ldbLate">This train is running {m} {m>1?"minutes":"minute"}{s?" "+s+"s":""} {loc.delay>0?"late":"early"}</div>
                </div>;
    }

    return  <div className={this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row"}>
              <div className="ldb-enttop">
                <div className={"ldbCol ldbForecast "+expectedClass}>{expected}</div>
                <div className={"ldbCol ldbSched"}>{fixtime(time)}</div>
                <div className="ldbCol ldbPlat">{plat ? plat.plat : null}</div>
                <div className="ldbCont">{destination}</div>
              </div>
              {via}
              {message}
              {calling}
              {delay}
              <div className="ldb-entbot">{toc}{length}{lastReport}</div>
            </div>;
  }
};

export default BoardRow;
