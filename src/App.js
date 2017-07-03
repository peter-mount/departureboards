import React, { Component } from 'react';
//import logo from './logo.svg';
import Stations from './Stations.js';
import Boards from './Boards.js';
import './App.css';

class App extends Component {

    config = {
        refreshRate: 5000
    }

    constructor(props) {
        super(props);

        this.state = {
            stations: true
        };

        console.log(window.location.search);
        console.log(window.location.hash);
        var search = window.location.search ? window.location.search.substr(1)
                : window.location.hash ? window.location.hash.substr(1)
                : null;
        if (search && search.length === 3) {
            // CRS code
            this.state = {};
            fetch('https://api.area51.onl/rail/2/station/' + search.toUpperCase())
                    .then(res => res.json())
                    .then(json => {
                        this.setState({
                            station: {
                                code: json.location.crs,
                                name: json.location.name,
                                label: json.location.name + ' [' + json.location.crs + ']'
                            }
                        });
                    })
                    .catch(e => {
                        window.history.replaceState({}, '', '/');
                        this.setState({
                            stations: true
                        });
                    });
        } else {
            window.history.replaceState({}, '', '/');
        }
    }

    stations = () => {
        this.setState({
            stations: true,
            station: null
        });
    }

    boards(station, t)
    {
        this.setState({
            stations: false,
            station: station
        });
    }

    render()
    {
        console.log(this.state);

        let button = null, body = null, title = null;

        if (this.state.stations) {
            body = <Stations app={this} />;
            title = 'Welcome to the new UK Departure Boards';
        }

        if (this.state.station) {
            title = this.state.station.name;
            button = <button className="leftButton btn btn-primary"
                    onClick={this.stations}
                    >Select another station</button>;
            body = <Boards app={this} station={this.state.station} />;
        }

        return  <div className="App">
            <div className="App-header">{button}<h2>{title}</h2></div>
            {body}
            <div id="outer-footer">
                <div id="inner-footer"> ©2011-2017 Peter Mount, All Rights Reserved.<br/>
                    Contains data provided by
                    <a href="http://www.networkrail.co.uk/">Network Rail</a>,
                    <a href="http://www.nationalrail.co.uk/">National Rail Enquiries</a>,
                    <a href="http://www.tfl.gov.uk">Transport for London</a>
                    and other public sector information licensed under the Open Government Licence.
                </div>
            </div>
        </div>;
    }
}

export default App;
