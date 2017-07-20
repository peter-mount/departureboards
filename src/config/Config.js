import React, { Component } from 'react';

class Config extends Component {

  constructor(props) {
    super(props);
    console.log('conf const');
  }

  render() {
    console.log('conf rend');

    return  <div>
              <div className="App-header">
                <h1>Configuration</h1>
              </div>
              <div className="App-intro">
                <h2>Options</h2>
                <p>The following options are available:</p>
                <table>
                  <tbody>
                    <tr>
                      <th className="center" colSpan="2">Services</th>
                    </tr>
                    <tr>
                      <th>Show services terminating here</th>
                      <td><input id="settingTerm" name="ldbTerm" default="f" type="checkbox" /></td>
                    </tr>
                    <tr>
                      <th className="center" colSpan="2">Calling points</th>
                    </tr>
                    <tr>
                      <th>Show for running services</th>
                      <td><input id="settingCall" name="ldbCall" default="t" type="checkbox" /></td>
                    </tr>
                    <tr>
                      <th>Show for terminated services</th>
                      <td><input id="settingTermCall" name="ldbTermCall" default="t" type="checkbox" /></td>
                    </tr>
                    <tr>
                      <th>Show for cancelled services</th>
                      <td><input id="settingCanCall" name="ldbCanCall" default="t" type="checkbox" /></td>
                    </tr>
                  </tbody>
                </table>
                <div> <a id="settingsCancel" className="ldbbutton">Cancel</a> <a id="settingsSave" className="ldbbutton">Save</a> </div>
              </div>
            </div>;
  }
}

export default Config;
