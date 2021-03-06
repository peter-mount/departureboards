import React, {Component} from 'react';

class Time extends Component {
    render() {
        let t = this.props.time;
        if (!t) {
            return null;
        }

        t = t.split(':');
        let s = (!this.props.terminated && this.props.arrived) ? 'a' : ':';

        return <span className={this.props.expected ? 'expected' : 'arrived'}>{t[0] + s + t[1]}</span>;
    }
}

export default Time;
