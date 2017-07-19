import React, { Component } from 'react';

class Info extends Component {
    render() {
        var val = this.props.value;
        if(val && this.props.linkPrefix)
            val=<a href={this.props.linkPrefix+val}>{val}</a>;

        return this.props.value === null || this.props.value === undefined
                ? null
                : <div className="ldb-row">
                    <div className="ldb-label">{this.props.label}</div>
                    <div className="ldb-value">{val}</div>
                </div>;
    }
}

export default Info;
