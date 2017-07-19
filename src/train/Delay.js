import React, { Component } from 'react';

class Delay extends Component {
    render() {
        var t = this.props.delay, full=this.props.full;
        if (!t)
            return null;

        t = t.split(':');

        var suff=full?' late':'L', c='delay_delayed';
        if(t[0].startsWith('-')) {
            suff=full?' early' : 'E';
            t[0]=t[0].substr(1);
            c='delay_early';
        }

        var r = t[1];
        if(t[0] !== '00' )
            r=t[0]+':'+t[1];

        if(r.startsWith('0'))
            r=r.substr(1);

        if(r==='0') {
            r=full?'' : 'OT';
            suff='';
            c='delay_ontime';
        }

        return <span className={full?'':c}>{r+suff}</span>;
    }
}

export default Delay;
