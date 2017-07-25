import React, { Component } from 'react';
import {Checkbox, Col, ControlLabel, FormControl, FormGroup, Grid, Row} from 'react-bootstrap';

class ConfigNetwork extends Component {

    constructor(props) {
      super(props);
      this.state = this.props.config;
    }

    update(f) {
      f();
      this.setState(this.state);
    }

  render() {
    var cfg = this.state.network;

    return  <Grid>
              <Row>
                <Col xs={12} md={12} sm={12}>
                  <FormGroup controlId="cfgNetRefresh">
                    <ControlLabel>Polling Refresh Rate</ControlLabel>
                    <FormControl
                      componentClass="select"
                      value={cfg.refreshRate}
                      onChange={(t)=>this.update(()=>cfg.refreshRate=t.target.value)}
                    >
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
              <Row>
                <Col xs={12} md={12} sm={12}>
                  <FormGroup controlId="cfsNetWsReconnect">
                    <ControlLabel>Websocket support</ControlLabel>
                    <Checkbox
                      checked={cfg.websocket.enabled}
                      onChange={()=>this.update(()=>cfg.websocket.enabled=!cfg.websocket.enabled)}
                    >Enabled</Checkbox>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={12} sm={12}>
                  <FormGroup controlId="cfsNetWsReconnect">
                    <ControlLabel>Websocket reconnect delay</ControlLabel>
                    <FormControl
                      componentClass="select"
                      value={cfg.websocket.reconnect}
                      onChange={(t)=>this.update(()=>cfg.websocket.reconnect=t.target.value)}
                    >
                      <option value="1000">1 seconds</option>
                      <option value="2000">2 seconds</option>
                      <option value="5000">5 seconds</option>
                      <option value="10000">10 seconds*</option>
                      <option value="15000">15 seconds</option>
                      <option value="20000">20 seconds</option>
                      <option value="25000">25 seconds</option>
                      <option value="30000">30 seconds</option>
                    </FormControl>
                  </FormGroup>
                </Col>
              </Row>
            </Grid>;
  }
}

export default ConfigNetwork;
