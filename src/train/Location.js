import React, { Component } from 'react';

class Location extends Component {
    render() {
        var tpl = this.props.data.tiploc[this.props.tiploc];
        return <span className="tiploc">{tpl ? tpl.name.replace('&amp;','&') : this.props.tiploc}</span>;
    }
}

export default Location;
