import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {Button, Tab, Tabs} from 'react-bootstrap';
import EUCookie from 'area51-eucookie';
import Navigation from '../Navigation';

import {getConfig, saveConfig} from './Config.js';
import ConfigBoards from './ConfigBoards.js';
import ConfigService from './ConfigService.js';
import ConfigSystem from './ConfigSystem.js';

class ConfigPage extends Component {

    render() {
        this.config = getConfig();

        return (<div>
            <Navigation page="configure"/>
            <EUCookie/>
            <div id="configWrapper" className="App-intro">
                <Tabs
                    defaultActiveKey={1}
                    id="configTabs"
                    animation={false}
                >

                    <Tab eventKey={1} title="Boards">
                        <ConfigBoards config={this.config}/>
                    </Tab>

                    <Tab eventKey={2} title="Services">
                        <ConfigService config={this.config}/>
                    </Tab>

                    <Tab eventKey={3} title="System">
                        <ConfigSystem config={this.config}/>
                    </Tab>

                </Tabs>
                <div id="configControls">
                    <Button bsStyle="danger" onClick={() => this.cancel()}>Cancel</Button>
                    <Button bsStyle="success" onClick={() => this.save()} style={{float: 'right'}}>Save</Button>
                </div>
            </div>
        </div>);
    }

//  <ConfigNetwork config={this.config} />
    save() {
        saveConfig(this.config);
        const {history} = this.props;
        history.goBack();
    }

    cancel() {
        const {history} = this.props;
        history.goBack();
    }
}

export default withRouter(ConfigPage);
