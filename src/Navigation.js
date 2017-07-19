import React, { Component } from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';

class Navigation extends Component {

  render() {
    var app = this.props.app, station, backToStation;

    if(this.props.station)
      station = <NavItem onClick={()=>app.stations()}>
                  Select another station
                </NavItem>;

    if(this.props.backToStation && this.props.backToStation.crs && this.props.backToStation.name) {
      var crs = this.props.backToStation.crs;
      backToStation = <NavItem onClick={()=>app.boards(crs)}>
                        Back to {this.props.backToStation.name} {crs}
                      </NavItem>;
    }

    return <Navbar inverse collapseOnSelect default fixedTop>
      <Navbar.Header>
        <Navbar.Brand>
          <a onClick={()=>app.stations()}>UK Departureboards</a>
        </Navbar.Brand>
        <Navbar.Toggle/>
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          {backToStation}
          {station}
          <NavItem onClick={ ()=>app.about() }>About</NavItem>
          <NavItem onClick={ ()=>app.contactUs() }>ContactUs</NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>;
  }
}

export default Navigation;
