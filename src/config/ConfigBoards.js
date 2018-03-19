import React, { Component } from 'react';

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
              onChange={()=>this.update(()=>cfg.showTerminated=!cfg.showTerminated)}
            >Show services terminating here</Checkbox>
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
              onChange={(t)=>this.update(()=>cfg.refreshRate=t.target.value)}
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
