import React, { Component } from 'react';

class Info extends Component {
    render() {
        var val = this.props.value;
        if(val && this.props.linkPrefix)
            val=<a href={this.props.linkPrefix+val}>{val}</a>;

        if( this.props.value === null || this.props.value === undefined )
          return null;

          var label = this.props.label ? <div className="ldb-label">{this.props.label}</div> : null;

          return  <div className="ldb-row">
                    {label}
                    <div className={this.props.className?this.props.className:"ldb-value"}>{val}</div>
                  </div>;
    }
}

export default Info;
