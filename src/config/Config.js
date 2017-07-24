import React, { Component } from 'react';
import {Button, Tab, Tabs} from 'react-bootstrap';

import ConfigBoards from './ConfigBoards.js';
import ConfigNetwork from './ConfigNetwork.js';

class Config extends Component {

  constructor(props) {
    super(props);
    console.log('conf const');

    this.config = this.props.app.getConfig();
  }

  render() {
    console.log('conf rend');

    return  <div>
              <div className="App-intro" style={{
                position: "absolute",
                top: "4em",
                bottom: "2.25em",
                left: "0.5em",
                right: "0.5em",
                border: "1px solid red"
              }}>
                <Tabs
                  defaultActiveKey={1}
                  id="configTabs"
                  animation={false}
                  style={{
                    position: "absolute",
                    top: "0em",
                    bottom: "2.5em",
                    left: "0em",
                    right: "0em",
                    border: "1px solid red"
                  }}
                >

                  <Tab eventKey={1} title="Boards">
                    <ConfigBoards config={this.config} />
                  </Tab>

                  <Tab eventKey={2} title="Network">
                    <ConfigNetwork config={this.config} />
                  </Tab>

                </Tabs>
                <div style={{
                  position: "absolute",
                  bottom: "0em",
                  left: "0em",
                  right: "0em"/*
                  marginTop: "2em",
                  marginLeft:"1em",
                  marginRight: "1em"*/
                }}>
                  <Button bsStyle="danger">Cancel</Button>
                  <Button bsStyle="success" style={{float:'right'}}>Save</Button>
                  </div>
                </div>
            </div>;
  }
}

export default Config;
