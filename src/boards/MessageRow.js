import React, {Component} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle'
import {faTrain} from '@fortawesome/free-solid-svg-icons/faTrain'
import {faLinux} from '@fortawesome/free-brands-svg-icons/faLinux'

/*
* Displays informational message
*/
class MessageRow extends Component {

    render() {
        let msg = this.props.msg, icon = faExclamationCircle;

        if (msg.category === 'System') {
            icon = faLinux;
        } else if (msg.category === "Station") {
            icon = faInfoCircle;
        } else if (msg.category === "Train") {
            icon = faTrain;
        } else if (msg.category === 'Information' || msg.category === 'PriorTrains' || msg.category === 'PriorOther') {
            icon = faInfoCircle
        }

        return (
            <div className={"ldb-enttop ldb-message " + (this.props.index % 2 === 0 ? "ldb-row altrow" : "ldb-row")}>
                <FontAwesomeIcon icon={icon} className="fas-3x"/>
                <span dangerouslySetInnerHTML={{__html: msg.message}}></span>
                <div className="clearfix"></div>
            </div>);
    }
};

export default MessageRow;
