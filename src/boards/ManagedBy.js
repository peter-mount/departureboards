import React, {Component} from 'react';

/*
* Displays informational message
*/
class ManagedBy extends Component {

    render() {
        let data = this.props.data, text;

        if (data) {
            let station = data.tiploc[data.station[0]],
                toc = data.toc[station.toc];

            if (toc) {
                text = <span>
          This station is managed by {toc.tocname}
        </span>;
            }
        }

        return <div className="ldb-row">
            <div className="ldb-enttop">{text}</div>
        </div>;
    }
}

export default ManagedBy;
