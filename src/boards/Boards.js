import React, {Component} from 'react';
import {withRouter} from 'react-router';
//import {PageHeader} from 'react-bootstrap';
import EUCookie from 'area51-eucookie';
import config from 'react-global-configuration';

// Note: if you change these css imports also update Service or check it also needs them
import '../../css/coach.css';
import '../../css/ldb.css';
import '../../css/media-320.css';
import '../../css/media-443.css';
import '../../css/media-640.css';
import '../../css/media-1023.css';
import '../../css/media-1599.css';
import '../../css/media-1600.css';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons/faSpinner'

import BoardRow, {timeRemaining} from './BoardRow.js';
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
        clearTimeout(this.flashTimer);
    }

    forceRender(t, crs, departures) {
        t.setState({
            crs: crs,
            departures: departures,
            flashTick: new Date().getSeconds()
        })
    }

    resetTimer(crs) {
        const t = this;
        clearTimeout(t.timer);
        t.timer = setTimeout(() => t.refresh(crs), config.get('refreshRate'));
    }

    // Retrieve the latest board
    refresh(crs) {
        const t = this;
        t.resetTimer(crs);

        let opts = [];

        if (!config.get("showTerminated")) {
            opts.push('term=false')
        }

        if (config.get("serviceLimit") > 0) {
            opts.push('len=' + config.get("serviceLimit"))
        }

        if (!config.get("disableCashBuster")) {
            opts.push('t=' + new Date().getTime());
        }

        let url = config.get('ldbUrl') + '/boards/' + crs + '?' + opts.join("&");

        fetch(url)
            .then(res => res.json())
            .then(departures => t.forceRender(t, crs, departures))
            .catch(e => {
                console.error(e);
            });
    }

    // Render the departure boards
    renderDepartures(crs, data) {

        let messages = null,
            rows = null,
            idx = 0,
            {flashTick} = this.state,
            enableFlash = false;

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
            let filterSuppressed = d => !(d.location && d.location.forecast && d.location.forecast.plat && d.location.forecast.plat.cissup),
                filterDeparted = d => !(d.location && d.location.forecast && d.location.forecast.departed),
                showCountdown = !config.get("hideCountdown"),
                flashExpected = !config.get("dontFlashExpected");

            rows = data.departures
                .filter(filterSuppressed)
                .filter(filterDeparted)
                .map((d, ind) => {
                    idx++;
                    enableFlash = enableFlash || (showCountdown && timeRemaining(d.location.forecast.time) != null);
                    return <BoardRow
                        key={d.rid + ':' + d.location}
                        board={this}
                        index={idx}
                        departure={d}
                        data={data}
                        crs={crs}
                        showCountdown={showCountdown}
                        flashExpected={flashExpected}
                        flashTick={flashTick}
                    />;
                })
        }

        clearTimeout(this.flashTimer);
        if (enableFlash && !config.get('dontFlashExpected')) {
            const t = this,
                s = t.state;
            t.flashTimer = setTimeout(() => t.forceRender(t, s.crs, s.departures), 1000);
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
            // Wrong crs then force refresh
            if (departures && departures.crs && departures.crs !== crs) {
                this.refresh(crs)
            }
            body = (<div>
                <FontAwesomeIcon icon={faSpinner} className="fa-pulse fa-3x fa-fw"/>
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
