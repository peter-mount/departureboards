import React, { Component } from 'react';

class Train extends Component {
    state = {
        
    };
    
    constructor(props) {
        super(props);
        console.log('Train',props);
        window.history.replaceState({},'','?'+props.rid);
        this.refresh(this);
    }
    
    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    refresh(t) {
        t.timer = setTimeout( ()=>t.refresh(t), t.props.app.config.refreshRate );
        fetch('https://api.area51.onl/rail/2/darwin/' + t.props.rid )
                .then(res => res.json())
                .then(json => {
                    console.log(json);
                    t.setState({data: json});
                });
    }

    render() {
        return <div>{this.state.rid}</div>;
    }
    
}

export default Train;
