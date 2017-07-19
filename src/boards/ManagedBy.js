import React, { Component } from 'react';

/*
 * Displays informational message
 */
class ManagedBy extends Component {

    render() {
      var operator = this.props.operator, text;

      if(operator)
        text =  <span>
                  This station is managed by {operator.name}
                </span>;

        return  <div class="ldb-row">
                  <div className="ldb-enttop">{text}</div>
                </div>;
    }
};

export default ManagedBy;
