import React, { Component } from 'react';

/*
 * A row on the board showing current status of a train
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

export default BoardRow;
