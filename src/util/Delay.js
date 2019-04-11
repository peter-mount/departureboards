import React, {Component} from 'react';

class Delay extends Component {
    render() {
        const p = this.props,
            d = p.delay,
            full = p.full,
            dm = Math.floor(d / 60),
            early = dm < 0,
            late = dm > 0;

        let suff = '', c = 'delay_ontime';
        if (early) {
            suff = full ? ' early' : 'E';
            c = 'delay_early';
        } else if (late) {
            suff = full ? ' late' : 'L';
            c = 'delay_delayed';
        }

        let r = dm ? Math.abs(dm) : 'OT'

        return <span className={full ? '' : c}>{r + suff}</span>;
    }
}

export default Delay;
