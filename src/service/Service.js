import React, {Component} from 'react';
import {withRouter} from 'react-router';
import EUCookie from 'area51-eucookie';
import Navigation from '../Navigation';
import Schedule from './Schedule';
import config from 'react-global-configuration';

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

        fetch('https://ldb.test.area51.dev/service/' + rid)
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
                    <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
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
