import React, {Component} from 'react';

import {Checkbox, Col, ControlLabel, FormControl, FormGroup, Grid, Row} from 'react-bootstrap';

class ConfigBoards extends Component {

    update(f) {
        f();
        this.forceUpdate();
    }

    render() {
        const cfg = this.props.config;

        return (<Grid>
            <Row>
                <Col xs={12} md={12} sm={12}>
                    <FormGroup controlId="cfgBoards">
                        <ControlLabel>Services</ControlLabel>
                        <Checkbox
                            checked={cfg.showTerminated}
                            onChange={() => this.update(() => cfg.showTerminated = !cfg.showTerminated)}
                        >Show services terminating here</Checkbox>
                        <Checkbox
                            checked={cfg.hideCalling}
                            onChange={() => this.update(() => cfg.hideCalling = !cfg.hideCalling)}
                        >Hide calling points</Checkbox>
                        <Checkbox
                            checked={cfg.showHeadcodes}
                            onChange={() => this.update(() => cfg.showHeadcodes = !cfg.showHeadcodes)}
                        >Show Headcodes</Checkbox>
                        <Checkbox
                            checked={cfg.hideCountdown}
                            onChange={() => this.update(() => cfg.hideCountdown = !cfg.hideCountdown)}
                        >Hide minute countdown when expected in under 10 minutes</Checkbox>
                        <Checkbox
                            checked={cfg.dontFlashExpected}
                            onChange={() => this.update(() => cfg.dontFlashExpected = !cfg.dontFlashExpected)}
                        >If countdown timer is shown don't flash it with expected time when delayed</Checkbox>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={12} sm={12}>
                    <FormGroup controlId="cfgBoardLimit">
                        <ControlLabel>Limit number of services shown in departure board</ControlLabel>
                        <FormControl
                            componentClass="select"
                            value={cfg.serviceLimit}
                            onChange={(t) => this.update(() => cfg.serviceLimit = t.target.value)}
                        >
                            <option value="0">Show all services</option>
                            <option value="1">1 service</option>
                            <option value="2">2 services</option>
                            <option value="3">3 services</option>
                            <option value="4">4 services</option>
                            <option value="5">5 services</option>
                            <option value="10">10 services</option>
                            <option value="15">15 services</option>
                            <option value="20">20 services</option>
                            <option value="25">25 services</option>
                            <option value="30">30 services</option>
                            <option value="35">35 services</option>
                        </FormControl>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={12} sm={12}>
                    <FormGroup controlId="cfgNetRefresh">
                        <ControlLabel>Polling Refresh Rate</ControlLabel>
                        <FormControl
                            componentClass="select"
                            value={cfg.refreshRate}
                            onChange={(t) => this.update(() => cfg.refreshRate = t.target.value)}
                        >
                            <option value="15000">15 seconds</option>
                            <option value="30000">30 seconds</option>
                            <option value="45000">45 seconds</option>
                            <option value="60000">60 seconds*</option>
                            <option value="120000">2 minutes</option>
                            <option value="180000">3 minutes</option>
                            <option value="300000">5 minutes</option>
                        </FormControl>
                    </FormGroup>
                </Col>
            </Row>
        </Grid>);
    }
}

export default ConfigBoards;
