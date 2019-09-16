import React, {Component} from 'react';
import {withRouter} from 'react-router';
import EUCookie from 'area51-eucookie';
import Navigation from '../Navigation';
import Schedule from './Schedule';
import config from 'react-global-configuration';

// Common with Boards
import '../../css/coach.css';
import '../../css/ldb.css';
import '../../css/media-320.css';
import '../../css/media-443.css';
import '../../css/media-640.css';
import '../../css/media-1023.css';
import '../../css/media-1599.css';
import '../../css/media-1600.css';

// Service additional entries
import '../../css/service.css';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons/faSpinner'

class Service extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        const {match} = this.props,
            {params} = match,
            rid = params.rid;
        this.refresh(rid, true);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    resetTimer(rid) {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => this.refresh(rid, false), config.get("serviceRefreshRate"));
    }

    static indexSchedule(s) {
        if (s && s.locations) {
            // Add index of each location
            for (let i = 0; i < s.locations.length; i++) {
                s.locations[i].id = i;
            }
            // Calculate last report until we add to the backend
            s.lastReport = s.locations.reduce((a, b) => b.forecast.arrived || b.forecast.departed ? b : a, null);
        }
    }

    refresh(rid, force) {
        this.resetTimer(rid);

        fetch(config.get('ldbUrl') + '/service/' + rid)
            .then(res => res.json())
            .then(json => {
                this.resetTimer(rid);
                Service.indexSchedule(json.service);

                if (json.service && json.service.association) {
                    for (let a of json.service.association) {
                        Service.indexSchedule(a.schedule)
                    }

                }

                this.setState({data: json});
            })
            .catch(e => {
                console.error(e);
                this.resetTimer(rid);
            });
    }

    render() {
        const {match, history} = this.props,
            {params} = match,
            rid = params.rid,
            d = this.state.data;

        if (this.state.hide || !d) {
            return (<div>
                <Navigation page="service"/>
                <EUCookie/>
                <div>
                    <FontAwesomeIcon icon={faSpinner} className="fa-pulse fa-3x fa-fw"/>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>);
        } else {
            return (<div>
                <Navigation page="service"/>
                <EUCookie/>
                <div className="App-header">
                    <Schedule service={d}/>
                </div>
            </div>);
        }
    }
}

export default withRouter(Service);
