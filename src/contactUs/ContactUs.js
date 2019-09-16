import React, {Component} from 'react';

import {withRouter} from 'react-router';
import EUCookie from "area51-eucookie";
import Navigation from '../Navigation';

class About extends Component {

    render() {
        return (<div>
            <Navigation page="contactUs"/>
            <EUCookie/>
            <div className="App-header">
                <h1>Contact Us</h1>
            </div>
            <div className="App-intro">
                <p>A contact form will appear here in the near future.</p>
                <p>Currently you can contact us via:</p>
                <ul>
                    <li>Twitter:
                        <ul>
                            <li><a href="http://twitter.com/TrainWatch">@Trainwatch</a></li>
                            <li><a href="http://twitter.com/peter_mount">@Peter_Mount</a></li>
                        </ul>
                    </li>
                </ul>
                <p>
                    Any issues can be reported on <a
                    href="https://github.com/peter-mount/departureboards/issues">GitHub</a>.
                </p>
            </div>
        </div>);
    }

}

export default withRouter(About);
