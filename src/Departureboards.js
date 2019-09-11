import React, {Component} from 'react';
//import {render} from 'react-dom';
import {BrowserRouter, Route} from 'react-router-dom';

import AboutLoader from "./loaders/AboutLoader";
import Boards from "./boards/Boards";
import ConfigPageLoader from "./loaders/ConfigPageLoader";
import ContactUsLoader from "./loaders/ContactUsLoader";
import HomePage from "./home/HomePage";
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
                    <Route component={HomePage} exact path='/'/>
                    <Route component={Boards} exact path='/departures/:crs'/>
                    <Route component={ServiceLoader} exact path='/service/:rid'/>
                    <Route component={AboutLoader} exact path='/about'/>
                    <Route component={ConfigPageLoader} exact path="/configure"/>
                    <Route component={ConfigPageLoader} exact path="/configure/:prev"/>
                    <Route component={ContactUsLoader} exact path="/contactUs"/>
                </div>
            </BrowserRouter>
        )
    }

}

export default Departureboards;

