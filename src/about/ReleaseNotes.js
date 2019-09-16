import React, {Component} from 'react';

import {withRouter} from 'react-router';
import EUCookie from 'area51-eucookie';
import Navigation from '../Navigation';
import {NavItem} from "react-bootstrap";

class ReleaseNotes extends Component {

    render() {
        const t = this;
        return (<div>
            <Navigation page="releaseNotes"/>
            <EUCookie/>
            <div className="App-header">
                <h1>Whats New</h1>
            </div>
            <div className="App-intro">
                <h2>Sep 16 2019</h2>
                <ul>
                    <li>General performance improvements to reduce amount of network bandwidth used to the client.</li>
                    <li>Ability to limit the number of services returned rather than all services in the next hour.</li>
                    <li>Terminating services are not returned unless you request it in configuration.</li>
                    <li>Ability to use our UAT environment instead of the Live one.</li>
                    <li>Release notes are now available via the <a
                        onClick={() => t.props.history.push("/releaseNotes")}>Whats New</a> page.
                    </li>
                </ul>
            </div>
        </div>);
    }

}

export default withRouter(ReleaseNotes);
