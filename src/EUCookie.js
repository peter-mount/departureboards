import React, { Component } from 'react';

/*
 * Handles 2002/58/EC aka the dreaded EU Cookie law
 */
class EUCookie extends Component {

  constructor(props) {
    super(props);

    var k = '2002/58/EC', e = localStorage.getItem(k), n = new Date().getTime(), c = null;

    if(e)
      try {
        e=JSON.parse(e);
      }catch(ex) {
        localStorage.removeKey(k);
        e=null;
      }

    if ((e && e[0] < n) || !e) {
      e=[n + 15552000000,n];
      localStorage.setItem(k, JSON.stringify(e));
      c=true;
    }

    this.state = {
      e: e,
      c: (n-e[1])<1000
    };

  }

  render()
  {
    return this.state.c
      ? <div className="alert alert-warning alert-dismissible">
          <button onClick={()=>this.close()} type="button" className="close" data-dismiss="alert" aria-hidden="true">Got&nbsp;It</button>
          <strong>Cookies:</strong> This site uses cookies to handle user session data. By continuing to use this site you agree in their use.
        </div>
      : null;
  }

  close() {
    this.setState({
      e: this.state.e,
      c: false
    });
  }
}

export default EUCookie;
