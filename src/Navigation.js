import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {Navbar, Nav, NavItem} from 'react-bootstrap';

import {isUAT} from './config/Config.js';

class Navigation extends Component {

    render() {
        const t = this;
        let station, backToStation;

        switch (this.props.page) {
            case 'departures':
                station = <NavItem onClick={() => t.props.history.push('/')}>
                    Select another station
                </NavItem>;
                break;

            case 'subpage':
                backToStation = <NavItem onClick={() => t.props.history.push('/departures/' + t.props.crs)}>
                    Back to {t.props.name.name}
                </NavItem>;
                break;

            default:
                break;
        }

        return (<Navbar inverse collapseOnSelect default fixedTop>
            <Navbar.Header>
                <Navbar.Brand>
                    <a onClick={() => t.props.history.push('/')}>
                        UK Departureboards{isUAT() ? " UAT" : ""}
                    </a>
                </Navbar.Brand>
                <Navbar.Toggle/>
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav>
                    {backToStation}
                    {station}
                    <NavItem onClick={() => t.props.history.push("/about")}>About</NavItem>
                    <NavItem onClick={() => t.props.history.push("/contactUs")}>ContactUs</NavItem>
                    <NavItem onClick={() => t.props.history.push("/configure")}>Configure</NavItem>
                    <NavItem onClick={() => t.props.history.push("/releaseNotes")}>Whats New</NavItem>
                </Nav>
            </Navbar.Collapse>
        </Navbar>);
    }
}

export default withRouter(Navigation);
