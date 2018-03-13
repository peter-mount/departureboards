import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {PageHeader, Tab, Tabs} from 'react-bootstrap';
import EUCookie from 'area51-eucookie';
import Navigation from '../Navigation';
import Schedule from './Schedule';

class Service extends Component {

  constructor( props ) {
    super( props );
    this.state = {}

    const { match } = this.props,
      { params } = match,
      rid = params.rid;
    this.refresh( rid, true );
  }

  resetTimer(rid) {
    if(this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => this.refresh(rid,false), 60000 );
  }

  refresh(rid,force) {
      // Don't update if too quick
    var now = new Date().getTime();
    //if(!force || (this.lastUpdate && (now-this.lastUpdate)<10000) )
    //  return ;

    this.lastUpdate=now;

    this.resetTimer();

    fetch('https://ldb.a.a51.li/service/' + rid)
      .then(res => res.json())
      .then(json => {
        this.resetTimer(rid);
        this.setState({data:json});
      })
      .catch(e => {
        console.error(e);
        this.resetTimer(rid);
      });
  }

  render() {
    const { match, history } = this.props,
    { params } = match,
    rid = params.rid,
    d = this.state.data;

    if (this.state.hide || !d) {
      return (<div>
        <Navigation page="service"/>
        <EUCookie />
        <div>
          <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
          <span className="sr-only">Loading...</span>
        </div>
      </div>);
    } else {
      return (<div>
        <Navigation page="service"/>
        <EUCookie />
        <div className="App-header">
          <Tabs defaultActiveKey={1} id="serviceTabs" animation={false}>

            <Tab eventKey={1} title="Schedule">
              <Schedule service={d}/>
            </Tab>

            <Tab eventKey={2} title="Details">
              details
            </Tab>

          </Tabs>
        </div>
      </div>);
    }
  }
}

export default withRouter( Service );
