import React, { Component } from 'react';
import {Col, Grid, Row} from 'react-bootstrap';

class ConfigBoards extends Component {

  render() {
    return  <Grid>
              <Row xs={12} md={12} sm={12}>
                <h4 className="config">Services</h4>
              </Row>
              <Row>
                <Col xs={8} md={8} sm={8}>
                  Show services terminating here
                </Col>
                <Col xs={4} md={4} sm={4}>
                  <input id="settingTerm" name="ldbTerm" default="f" type="checkbox" />
                </Col>
              </Row>
              <Row xs={12} md={12} sm={12}>
              <h4 className="config">Calling points</h4>
              </Row>
              <Row>
                <Col xs={8} md={8} sm={8}>
                  Show for running services
                </Col>
                <Col xs={4} md={4} sm={4}>
                  <input id="settingCall" name="ldbCall" default="t" type="checkbox" />
                </Col>
              </Row>
              <Row>
                <Col xs={8} md={8} sm={8}>
                  Show for terminated services
                </Col>
                <Col xs={4} md={4} sm={4}>
                  <input id="settingTermCall" name="ldbTermCall" default="t" type="checkbox" />
                </Col>
              </Row>
              <Row>
                <Col xs={8} md={8} sm={8}>
                  Show for cancelled services
                </Col>
                <Col xs={4} md={4} sm={4}>
                  <input id="settingCanCall" name="ldbCanCall" default="t" type="checkbox" />
                </Col>
              </Row>
              <Row>
                <Col xs={8} md={8} sm={8}>
                </Col>
                <Col xs={4} md={4} sm={4}>
                </Col>
              </Row>
            </Grid>;
  }
}

export default ConfigBoards;
