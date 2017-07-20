import React, { Component } from 'react';

class About extends Component {

  render() {
    return  <div>
              <div className="App-header">
                <h1>Realtime Departure Boards</h1>
              </div>
              <div className="App-intro">
                <p>This application provides real time departure board information for every railway station in England, Scotland and Wales as well as every station on the London Underground. When you navigate through the site, you will be shown the trains for up to the next hour.</p>

                <h1>National Rail Enquiries</h1>
                <div className="logo-container">
                  <img className="logo-nre" alt="Powered by National Rail Enquiries" src="./NRE_Powered_logo.jpg" />
                </div>
                <p> For the mainline stations, the application is a view on the Darwin Push Port real time feed from National Rail Enquiries. </p>
                <p> This feed provides both timetabled times for services but also actual as well as the predicted arrival &amp; departure times for services, so when a service is delayed then we will show the same predicted times as National Rail Enquiries have access to. </p>

                <h1>Open Data</h1>
                <p> For more information on the open data: </p>
                <ul>
                  <li>
                    <a href="http://uktra.in/">Parent uktra.in website.</a>
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
              </div>
            </div>;
  }
}

export default About;
