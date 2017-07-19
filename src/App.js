import React, { Component } from 'react';
//import logo from './logo.svg';
import About from './info/About.js';
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

      // On history changes set the page
      window.onpopstate = ()=>this.setPage();

      // Select the page
      this.setPage();
    }

    setPage() {
      this.state = {
      };

      var search = window.location.search ? window.location.search.substr(1)
              : window.location.hash ? window.location.hash.substr(1)
              : null;

      // debug
      //if(!search || search.length<2)
        //search='201707198780786';
        //search='MDE';

      setTimeout(()=>{
        if (search && search.length === 3) {
          // CRS code
          this.boards(search);
        } else if (search && search.length === 15) {
          // RID
          this.train(search,null);
        } else {
          this.stations();
        }
      },10);
    }

    setPath(q) {
      if(q!==window.location.search)
        window.history.pushState({},'','/?'+q);
    }

    stations = (msg) => {
      this.setState({
        stations: true,
        msg: msg,
        about: false,
        contact: false,
        station: null,
        rid:null,
        returnStation: null
      });
    }

    boards(station)
    {
      fetch('https://api.area51.onl/rail/2/station/' + station.toUpperCase() )
        .then(res => res.json())
        .then(json => {
          // null location then crs not recognised
          if(json.location)
            this.setState({
              stations: false,
              about: false,
              contact: false,
              station: json,
              rid:null,
              returnStation: null
            });
          else
            this.stations('Unable to locate '+station)
        })
        .catch(()=> this.stations('Unable to locate '+station) );
    }

    train(rid, returnStation)
    {
      this.setState({
        stations: false,
        about: false,
        contact: false,
        rid: rid,
        returnStation: returnStation
      });
    }

    about()
    {
      this.setState({
        about: true,
        contact: false,
        stations: false,
        rid: null,
        returnStation: null
      });
    }

    contactUs()
    {
      this.setState({
        contact: true,
        stations: false,
        about: false,
        rid: null,
        returnStation: null
      });
    }

    render()
    {
        let body, nav;

console.log(this.state);
        if( this.state.about ) {
          nav = <Navigation app={this} />
          body = <About app={this} />;
        }
        else if (this.state.stations) {
          nav = <Navigation app={this} />
          body = <Stations app={this} />;
        }
        else if (this.state.station) {
          nav = <Navigation app={this} station={ ()=>this.stations() }/>
          // Key here so react knows to force refresh when moving between boards
          body = <Boards key={this.state.station.location.crs} app={this} station={this.state.station} />;
        }
        else if( this.state.rid) {
          if(this.state.returnStation && this.state.returnStation.crs)
            nav = <Navigation
                    app={this}
                    station={ ()=>this.stations() }
                    backToStation={this.state.returnStation}
                  />
          else
            nav = <Navigation
                    app={this}
                    station={ ()=>this.stations() }
                  />
          body = <Train app={this} rid={this.state.rid} />;
        }

        return <div className="App">
                {nav}
                {body}
                <div id="outer-footer">
                  <div id="inner-footer">
                    ©2011-{1900+new Date().getYear()} Peter Mount, All Rights Reserved.<br/>
                    Contains data provided by <a href="http://www.networkrail.co.uk/">Network Rail</a>, <a href="http://www.nationalrail.co.uk/">National Rail Enquiries</a> and other public sector information licensed under the Open Government Licence.
                  </div>
                </div>
              </div>;
    }
}

export default App;
