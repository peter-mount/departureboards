import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter, Route} from 'react-router-dom';

import About from "./about/About";
import Boards from "./boards/Boards";
import ConfigPage from "./config/ConfigPage";
import ContactUs from "./contactUs/ContactUs";
import HomePage from "./home/HomePage";
import Service from "./service/Service";

// Initialise config
import {getConfig} from './config/Config.js';

getConfig()

render(
    <BrowserRouter>
        <div>
            <Route component={HomePage} exact path='/'/>
            <Route component={Boards} exact path='/departures/:crs'/>
            <Route component={Service} exact path='/service/:rid'/>
            <Route component={About} exact path='/about'/>
            <Route component={ConfigPage} exact path="/configure"/>
            <Route component={ConfigPage} exact path="/configure/:prev"/>
            <Route component={ContactUs} exact path="/contactUs"/>
        </div>
    </BrowserRouter>,
    document.getElementById('root')
);
