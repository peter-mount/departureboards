import React, {Component} from 'react';

/*
* Displays informational message
*/
class MessageRow extends Component {

    render() {
        let msg = this.props.msg, icon = 'fas-3x fa-exclamation-circle';

        if (msg.category === 'System') {
            icon = 'fab-3x fa-linux';
        } else if (msg.category === "Station") {
            icon = 'fas-3x fa-info-circle';
        } else if (msg.category === "Train") {
            icon = 'fas-3x fa-train';
        } else if (msg.category === 'Information' || msg.category === 'PriorTrains' || msg.category === 'PriorOther') {
            icon = 'fas-3x fa-info-circle';
        }

        return (
            <div className={"ldb-enttop ldb-message " + (this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row")}>
                <i aria-hidden="true" className={"fa " + icon}/>
                <span dangerouslySetInnerHTML={{__html: msg.message}}></span>
                <div className="clearfix"></div>
            </div>);
    }
};

export default MessageRow;
