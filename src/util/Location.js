import React, {Component} from 'react';

class Location extends Component {
    render() {
        const p = this.props,
            data = p.data,
            tiploc = p.tiploc;
        const tpl = data.tiploc[tiploc];
        return <span className="tiploc">{tpl ? tpl.locname.replace('&amp;', '&') : tiploc}</span>;
    }
}

export default Location;
