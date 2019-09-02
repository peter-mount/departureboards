import React, {Component} from 'react';

import {Checkbox, Col, ControlLabel, FormControl, FormGroup, Grid, Row} from 'react-bootstrap';

import {setServer} from './Config.js';

class ConfigSystem extends Component {

    update(f) {
        f();
        this.forceUpdate();
    }

    render() {
        const cfg = this.props.config;

        return (<Grid>
            <Row>
                <Col xs={12} md={12} sm={12}>
                    <FormGroup controlId="cfgSystem">
                        <ControlLabel>System</ControlLabel>
                        <Checkbox
                            checked={cfg.useUAT}
                            onChange={() => this.update(() => setServer(cfg, !cfg.useUAT))}
                        >Use UAT instead of live for data</Checkbox>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={12} sm={12}>
                    <FormGroup controlId="cfgSystemCache">
                        <ControlLabel>Network API Caching</ControlLabel>
                        <Checkbox
                            checked={cfg.disableCashBuster}
                            onChange={() => this.update(() => cfg.disableCashBuster = !cfg.disableCashBuster)}
                        >Disable cache busting on API requests</Checkbox>
                    </FormGroup>
                </Col>
            </Row>
        </Grid>);
    }
}

export default ConfigSystem;
