import React, {Component} from 'react';

/*
* Displays informational message
*/
class MessageRow extends Component {

    render() {
        let msg = this.props.msg, icon = 'fa-warning';

        if (msg.category === 'System') {
            icon = 'fa-linux';
        } else if (msg.category === "Station") {
            icon = 'fa-info-circle';
        } else if (msg.category === 'Information' || msg.category === 'PriorTrains' || msg.category === 'PriorOther') {
            icon = 'fa-info-circle';
        }

        return (
            <div className={"ldb-enttop ldb-message " + (this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row")}>
                <i aria-hidden="true" className={"fa " + icon + ' fa-3x'}/>
                <span dangerouslySetInnerHTML={{__html: msg.message}}></span>
                <div className="clearfix"></div>
            </div>);
    }
};

export default MessageRow;
