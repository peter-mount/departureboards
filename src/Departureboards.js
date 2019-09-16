import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

import '../css/App.css';
import '../css/materialicons.css';

// The loaders for each route
import AboutLoader from "./loaders/AboutLoader";
import BoardsLoader from "./loaders/BoardsLoader";
import ConfigPageLoader from "./loaders/ConfigPageLoader";
import ContactUsLoader from "./loaders/ContactUsLoader";
import HomePageLoader from "./loaders/HomePageLoader";
import ReleaseNotesLoader from "./loaders/ReleaseNotesLoader";
import ServiceLoader from "./loaders/ServiceLoader";

// Initialise config
import {getConfig} from './config/Config.js';

class Departureboards extends Component {

    componentDidMount() {
        getConfig()
    }

    render() {
        console.log("Component render");
        return (
            <BrowserRouter>
                <div>
                    <Route component={HomePageLoader} exact path='/'/>
                    <Route component={BoardsLoader} exact path='/departures/:crs'/>
                    <Route component={ServiceLoader} exact path='/service/:rid'/>
                    <Route component={AboutLoader} exact path='/about'/>
                    <Route component={ReleaseNotesLoader} exact path='/releaseNotes'/>
                    <Route component={ConfigPageLoader} exact path="/configure"/>
                    <Route component={ConfigPageLoader} exact path="/configure/:prev"/>
                    <Route component={ContactUsLoader} exact path="/contactUs"/>
                </div>
            </BrowserRouter>
        )
    }

}

export default Departureboards;

