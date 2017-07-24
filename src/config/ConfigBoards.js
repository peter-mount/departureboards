import React, { Component } from 'react';
import {Checkbox, Col, ControlLabel, FormGroup, Grid, Row} from 'react-bootstrap';

class ConfigBoards extends Component {

  render() {
    var cfg = this.props.config.boards;

    return  <Grid>
              <Row>
                <Col xs={12} md={12} sm={12}>
                  <FormGroup controlId="cfsNetWsReconnect">
                    <ControlLabel>Services</ControlLabel>
                    <Checkbox checked={cfg.services.terminated}>Show services terminating here</Checkbox>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={12} md={12} sm={12}>
                  <FormGroup controlId="cfsNetWsReconnect">
                    <ControlLabel>Calling points</ControlLabel>
                      <Checkbox checked={cfg.calling.running}>Show for running services</Checkbox>
                      <Checkbox checked={cfg.calling.terminated}>Show for terminated services</Checkbox>
                      <Checkbox checked={cfg.calling.cancelled}>Show for cancelled services</Checkbox>
                  </FormGroup>
                </Col>
              </Row>
            </Grid>;
  }
}

export default ConfigBoards;
