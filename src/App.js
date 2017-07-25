import React, { Component } from 'react';
//import logo from './logo.svg';
import About from './info/About.js';
import Boards from './boards/Boards.js';
import Config from './config/Config.js';
import ContactUs from './info/ContactUs.js';
import EUCookie from './EUCookie.js';
import Navigation from './Navigation.js';
import Stations from './Stations.js';
import Train from './train/Train.js';

import './css/App.css';
import './css/Config.css';
import './css/ldb.css';
import './css/media.css';

import {version} from '../package.json';

class App extends Component {

    constructor(props) {
      super(props);

      // Load/init config
      this.config = this.getConfig();

      // On history changes set the page
      window.onpopstate = ()=>this.setPage();

      // Select the page
      this.setPage();
    }

    getConfig() {
      var config;
        try {
          config = JSON.parse( localStorage.getItem('config') );
        }catch(e) {
          config=null;
        }
      if(!config) {
        config = {
            boards: {
              services: {
                terminated: false,
              },
              calling: {
                running: true,
                terminated: false,
                cancelled: false
              }
            },
            network: {
              refreshRate: 60000,
              websocket: {
                enabled: true,
                reconnect: 10000
              }
            }
        }
        this.saveConfig(config);
      }
      return config;
    }

    saveConfig(config) {
      if(config) {
        this.config=config;
        localStorage.setItem('config', JSON.stringify(config));
      }
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

    configure = () => {
      this.setState({
        configure: true,
        ret: this.state,
        stations: false,
        msg: null,
        about: false,
        contact: false,
        station: null,
        rid:null,
        returnStation: null
      });
    }

    stations = (msg) => {
      this.setState({
        stations: true,
        msg: msg,
        configure: false,
        ret: null,
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
              configure: false,
              ret: null,
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
        configure: false,
        ret: null,
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
        configure: false,
        ret: null,
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
        configure: false,
        ret: null,
        stations: false,
        about: false,
        rid: null,
        returnStation: null
      });
    }

    render()
    {
        let body, nav;

        if( this.state.configure ) {
          nav = <Navigation app={this} />
          body = <Config app={this} ret={this.state.ret} />;
        }
        else if( this.state.about ) {
          nav = <Navigation app={this} />
          body = <About app={this} />;
        }
        else if( this.state.contact ) {
          nav = <Navigation app={this} />
          body = <ContactUs app={this} />;
        }
        else if (this.state.stations) {
          nav = <Navigation app={this} />
          body = <Stations app={this} />;
        }
        else if( this.state.rid) {
          if(this.state.returnStation && this.state.returnStation.crs)
            nav = <Navigation app={this} backToStation={this.state.returnStation} />
          else
            nav = <Navigation app={this} station={ ()=>this.stations() } />

          body = <Train app={this} rid={this.state.rid} />;
        }
        else if (this.state.station) {
          nav = <Navigation app={this} station={ ()=>this.stations() }/>
          // Key here so react knows to force refresh when moving between boards
          body = <Boards key={this.state.station.location.crs} app={this} station={this.state.station} />;
        }

        return  <div className="App">
                  {nav}
                  <EUCookie/>
                  <div className="AppBody">
                    {body}
                  </div>
                  <div id="outer-footer">
                    <div id="inner-footer">
                      ©2011-{1900+new Date().getYear()} Peter Mount, All Rights Reserved. Contains data provided by <a href="http://www.networkrail.co.uk/">Network Rail</a>, <a href="http://www.nationalrail.co.uk/">National Rail Enquiries</a> &amp other public sector information licensed under the Open Government Licence. {version}
                    </div>
                  </div>
                </div>;
    }
}

export default App;
