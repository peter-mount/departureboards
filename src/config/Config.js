import React, { Component } from 'react';
import {Button, Tab, Tabs} from 'react-bootstrap';

import ConfigBoards from './ConfigBoards.js';
import ConfigNetwork from './ConfigNetwork.js';

class Config extends Component {

  constructor(props) {
    super(props);
    this.config = this.props.app.getConfig();
  }

  render() {
    return  <div>
              <div id="configWrapper" className="App-intro">
                <Tabs
                  defaultActiveKey={1}
                  id="configTabs"
                  animation={false}
                >

                  <Tab eventKey={1} title="Boards">
                    <ConfigBoards config={this.config} />
                  </Tab>

                  <Tab eventKey={2} title="Network">
                    <ConfigNetwork config={this.config} />
                  </Tab>

                </Tabs>
                <div id="configControls">
                  <Button bsStyle="danger" onClick={()=>this.cancel()}>Cancel</Button>
                  <Button bsStyle="success" onClick={()=>this.save()} style={{float:'right'}}>Save</Button>
                </div>
              </div>
            </div>;
  }

  save() {
    this.props.app.saveConfig(this.config);
    this.showPreviousPage();
  }

  cancel() {
    this.showPreviousPage();
  }

  showPreviousPage() {
    this.props.app.setState(this.props.app.state.ret);
  }
}

export default Config;
