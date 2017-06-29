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
                    //station: {code: "MDE", name: "Maidstone East", label: "Maidstone East [MDE]"}
                    //station: {code: "VIC", name: "London Victoria", label: "London Victoria [VIC]"}
                    //station: {code: "CHX", name: "London Charing Cross", label: "London Charing Cross [CHX]"}
        };
        
        

        console.log(window.location.search);
        if (window.location.search) {
            if (window.location.search.length === 4) {
                this.state = {};
                fetch('https://api.area51.onl/rail/2/station/' + window.location.search.substr(1).toUpperCase())
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
                            this.setState({
                                stations: true
                            });
                        });
            }
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

        return (
                <div className="App">
                    <div className="App-header">{button}<h2>{title}</h2></div>
                    {body}
                </div>
                );
    }
}

export default App;
