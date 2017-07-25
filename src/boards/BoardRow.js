import React, { Component } from 'react';

/*
 * A row on the board showing current status of a train
 */
class BoardRow extends Component {

  // Used to fix calling point names so they don't break
  fix(s) {
    return this.fix1(s,' ','&nbsp;');
  }
  fix1(s,a,b) {
    while(s.indexOf(a)>=0)
      s=s.replace(a,b);
    return s;
  }

  render() {
    var train = this.props.departure.train,
        status = this.props.departure.status,
        sched = this.props.departure.schedule,
        srcCalling = this.props.departure.calling;

    var departs = sched.ptd, destination = train.dest;
    if (status.terminatesHere) {
      destination = 'Terminates Here';
    }

    var expected = 'On Time', expectedClass='ldbOntime';
    if(status.cancelled) {
      expected = 'Cancelled';
      expectedClass = 'ldbCancelled';
    } else if (status.arrived)
      expected = 'Arrived';
    else if (status.departed)
      expected = 'Departed';
    else if (status.delayed) {
      expected = 'Delayed';
      expectedClass = 'ldbLate';
    } else if (status.delay > 0) {
      expected = status.time;
      expectedClass = 'ldbLate';
    }

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
    if (srcCalling && srcCalling.length > 0)
        calling = <div className="ldb-entbot">
                    <span className="callList" > Calling at:</span> {
                      this.props.departure.calling.map(
                        cp => <span key={cp.crs} className="callList" ><a onClick={()=>this.props.app.boards(cp.crs)} dangerouslySetInnerHTML={{__html: this.fix(cp.name)}}></a>&nbsp;({cp.time}) </span>
                    )}
                  </div>;

    return  <div className={this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row"}>
              <div className="ldb-enttop">
                <div className={"ldbCol ldbForecast "+expectedClass}>{expected}</div>
                <div className={"ldbCol ldbSched "+expectedClass}>{departs}</div>
                <div className="ldbCol ldbPlat">{status.platform}</div>
                <div className="ldbCont">
                  <a onClick={()=>this.props.app.train(train.rid,this.props.station)}>{destination}</a>
                </div>
              </div>
              {message}
              {calling}
              <div className="ldb-entbot">{toc}{length}{lastReport}</div>
            </div>;
  }
};

export default BoardRow;
