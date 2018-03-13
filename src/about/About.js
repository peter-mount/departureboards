import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {PageHeader, Tab, Tabs} from 'react-bootstrap';
import EUCookie from 'area51-eucookie';
import Navigation from '../Navigation';

class About extends Component {

  render() {
    return  (<div>
      <Navigation page="about"/>
      <div className="App-header">
        <PageHeader>Realtime Departure Boards</PageHeader>
      </div>
      <div className="App-intro">
        <Tabs defaultActiveKey={1} id="aboutTabs" animation={false}>

          <Tab eventKey={1} title="Intro">
            <p>
              This application provides real time departure board information for every railway station in England, Scotland and Wales.
            </p>
            <p>
              When you navigate through the site, you will be shown the trains for up to the next hour.
            </p>
            <p>
              On each departure board you can select any calling point for each service to switch to that station.
            </p>
            <p>
              Also by selecting the destination of a service you can see the full timetable of that service including any Realtime updates made to it.
            </p>
          </Tab>

          <Tab eventKey={2} title="National Rail Enquiries">
            <h1>National Rail Enquiries</h1>
            <p> For the mainline stations, the application is a view on the Darwin Push Port real time feed from National Rail Enquiries. </p>
            <p> This feed provides both timetabled times for services but also actual as well as the predicted arrival &amp; departure times for services, so when a service is delayed then we will show the same predicted times as National Rail Enquiries have access to. </p>
            <div className="logo-container" style={{textAlign:'center'}}>
              <img className="logo-nre" alt="Powered by National Rail Enquiries" src="./NRE_Powered_logo.jpg" />
            </div>
          </Tab>

          <Tab eventKey={3} title="Open Data">
            <h1>Open Data</h1>
            <p> For more information on the open data: </p>
            <ul>
              <li>
                <a href="https://github.com/peter-mount/nre-feeds">Github repository of the backend used by this application.</a>
              </li>
              <li>
                <a href="http://nrodwiki.rockshore.net/index.php/Main_Page">Open Rail Data wiki.</a>
              </li>
              <li>
                <a href="http://nrodwiki.rockshore.net/index.php/Darwin:Push_Port">Darwin Push Port feed details.</a>
              </li>
              <li>
                <a href="https://groups.google.com/forum/#!forum/openraildata-talk">Open Rail Data forum</a>
              </li>
            </ul>
          </Tab>

        </Tabs>

      </div>
    </div>);
  }

}

export default withRouter( About );
