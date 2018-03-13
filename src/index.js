import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import Boards from "./boards/Boards";
import HomePage from "./home/HomePage";

render(
  <BrowserRouter>
    <div>
      <Route
        component={HomePage}
        exact
        path='/'
      />
      <Route
        component={Boards}
        exact
        path='/departures/:crs'
      />
    </div>
  </BrowserRouter>,
  document.getElementById('root')
);
