import React, { Component } from 'react';
//import logo from './logo.svg';
import Navigation from './Navigation.js';
import Stations from './Stations.js';
import Boards from './boards/Boards.js';
import Train from './train/Train.js';

import './css/App.css';
import './css/ldb.css';
import './css/media.css';

class App extends Component {

    config = {
        refreshRate: 60000
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

        // debug
        search='MDE';

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
        } else if (search && search.length === 15) {
            this.state ={
                stations: false,
                rid: search
            };
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

    train(rid, t)
    {
        this.setState({
            stations: false,
            rid: rid
        });
    }

    render()
    {
        let body, nav, t=this;

        if (this.state.stations) {
          nav = <Navigation app={this} />
          body = <Stations app={this} />;
        }

        if (this.state.station) {
          nav = <Navigation app={this} station={ ()=>this.stations() }/>
          body = <Boards app={this} station={this.state.station} />;
        }

        if( this.state.rid)
            body = <Train app={this} rid={this.state.rid} />;

        return <div className="App">
                {nav}
                {body}
                <div id="outer-footer">
                  <div id="inner-footer">
                    ©2011-2017 Peter Mount, All Rights Reserved.<br/>
                    Contains data provided by <a href="http://www.networkrail.co.uk/">Network Rail</a>, <a href="http://www.nationalrail.co.uk/">National Rail Enquiries</a> and other public sector information licensed under the Open Government Licence.
                  </div>
                </div>
              </div>;
    }
}

export default App;
