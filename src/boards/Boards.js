import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {PageHeader} from 'react-bootstrap';
import EUCookie from 'area51-eucookie';
import config from 'react-global-configuration';

import BoardRow from './BoardRow.js';
import ManagedBy from './ManagedBy.js';
import MessageRow from './MessageRow.js';
import Navigation from '../Navigation';

/*
* Main class that handles the display of a stations departure board
*/
class Boards extends Component {

    constructor(props) {
        super(props);
        this.state = {
            departures: null
        };
    }

    componentDidMount() {
        const {match} = this.props,
            {params} = match,
            crs = params.crs;
        this.refresh(crs);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    resetTimer(crs) {
        const t = this;
        clearTimeout(t.timer);
        t.timer = setTimeout(() => t.refresh(crs), config.get('refreshRate'));
    }

    // Retrieve the latest board
    refresh(crs) {
        const t = this;
        t.resetTimer(crs)
        fetch(config.get('ldbUrl') + '/boards/' + crs + '?' + new Date())
            .then(res => res.json())
            .then(departures => t.setState({departures: departures}))
            .catch(e => {
                console.error(e);
            });
    }

    // Render the departure boards
    renderDepartures(crs, data) {

        let messages = null, rows = null, idx = 0

        if (data.messages) {
            messages = data.messages
                .filter(msg => !msg.suppress)
                .map((msg, ind) => {
                    idx++;
                    return <MessageRow
                        key={'row' + idx}
                        board={this}
                        index={idx}
                        msg={msg}
                    />;
                });
        }

        if (data.departures) {
            let filterTerminated = d => true,
                filterSuppressed = d => !(d.location && d.location.forecast && d.location.forecast.plat && d.location.forecast.plat.cissup),
                filterDeparted = d => !(d.location && d.location.forecast && d.location.forecast.departed);

            if (!config.get("showTerminated")) {
                // Filter out terminations
                filterTerminated = d => !(data.tiploc[d.destination] && data.tiploc[d.destination].crs === crs);
            }

            rows = data.departures
                .filter(filterSuppressed)
                .filter(filterTerminated)
                .filter(filterDeparted)
                .map((d, ind) => {
                    idx++;
                    return <BoardRow
                        key={d.rid}
                        board={this}
                        index={idx}
                        departure={d}
                        data={data}
                        crs={crs}
                    />;
                })
        }
        return <div>{messages}{rows}</div>;
    }

    render() {
        const {match, history} = this.props,
            {params} = match,
            crs = params.crs;

        let body, {departures} = this.state;

        // Render data unless we have none or we are changing stations
        if (departures && departures.crs === crs) {
            body = this.renderDepartures(crs, departures);
        } else {
            this.refresh(crs);
            body = (<div>
                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"/>
                <span className="sr-only">Loading...</span>
            </div>);
        }

        let loc = departures ? departures.tiploc[departures.station[0]] : null,
            locName = loc ? loc.locname : crs;

        return (<div>
            <Navigation page="departures"/>
            <EUCookie/>
            <div className="App-header">
                <h2>{locName}</h2>
                <div className="ldbWrapper">
                    <div className="ldbTable">
                        <div className="ldbHead">
                            <div className="ldbCol ldbForecast">Expected</div>
                            <div className="ldbCol ldbSched">Departs</div>
                            <div className="ldbCol ldbPlat">Plat</div>
                            <div className="ldbCont">Destination</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="App-intro">
                {body}
                <ManagedBy data={departures}/>
            </div>
        </div>);
    }
}

export default withRouter(Boards);
