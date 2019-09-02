import React, {Component} from 'react';

import {Checkbox, Col, ControlLabel, FormControl, FormGroup, Grid, Row} from 'react-bootstrap';

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
                            onChange={() => this.update(() => {
                                cfg.useUAT = !cfg.useUAT;
                                if (cfg.useUAT) {
                                    cfg.ldbUrl = 'https://ldb.test.area51.dev';
                                    cfg.refUrl = 'https://ref.test.area51.dev'
                                } else {
                                    cfg.ldbUrl = 'https://ldb.a.a51.li';
                                    cfg.refUrl = 'https://ref.a.a51.li'
                                }
                            })}
                        >Use UAT instead of live</Checkbox>
                    </FormGroup>
                </Col>
            </Row>
        </Grid>);
    }
}

export default ConfigSystem;
