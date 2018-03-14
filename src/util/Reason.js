import React, { Component } from 'react';

/*
 * Handles the rendering of a cancellation or late reason
 *
 * Properties:
 * data   The root json containing optional reasons and tiploc lookup maps
 * reason The full reason object to render
 * canc   Lookup cancel else late reason
 *
 * This returns null if reason is null, code 0 or reasons map is not present.
 */
class Reason extends Component {
  render() {
    const p = this.props,
      d = p.data,
      r = p.reason;
    if (r && r.reason > 0 && d.reasons) {
      var map = p.canc ? d.reasons.cancelled : d.reasons.late,
        reason = map ? map[r.reason] : null,
        msg = reason ? reason.reasontext : ("reason " + r.reason),
        nearAt;
      if (reason && reason.tiploc) {
        nearAt = <span className="nearAt">
            {reason.near ? 'near' : 'at'} <Location data={d} tiploc={reason.tiploc}/>
          </span>;
      }
      return <span className={reason.canc?'cancelReason':'lateReason'}>{msg} {nearAt}</span>;
    }
    return null;
  }
}

export default Reason;
