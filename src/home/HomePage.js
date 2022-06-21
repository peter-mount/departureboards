import React, {Component} from 'react';

import {withRouter} from 'react-router';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import Navigation from '../Navigation';
import config from 'react-global-configuration';

class HomePage extends Component {

    constructor(props) {
        super(props);
        this.state = {options: []};
    }

    componentDidMount() {
        this.setState({options: []});
    }

    // Perform the query
    search(query, t) {
        fetch(config.get('refUrl') + '/search/' + query)
            .then(resp => resp.json())
            .then(json => t.setState({
                options: json ? json : []
            }))
            .catch((e) => {
                // Retry after 1 second
                setTimeout(() => t.search(query, t), 1000);
            });
    }

    // Handle the selection. Only pass 1 entry to the app
    select(selection, t) {
        if (selection && selection.length === 1) {
            t.props.history.push('/departures/' + selection[0].code)
        }
    }

    render() {
        const t = this;
        return (<div>
            <Navigation/>
            <div className="App-header">
                <h1>Realtime UK Departure Boards</h1>

            </div>
            <div className="App-intro">
                <div className="station-form">
                    <div>
                        <div id="stationlabel" htmlFor="stations">
                            Please enter the station you want to view below:
                        </div>
                        <AsyncTypeahead
                            id="stations"
                            useCache={false}
                            minLength={3}
                            onSearch={query => this.search(query, this)}
                            onChange={selection => this.select(selection, this)}
                            options={this.state.options}
                            placeholder="Type a station name or CRS code"
                            ref={(input) => this.focus = input}
                            filterBy={(o, t) => true}
                        />
                    </div>
                </div>
                <p>
                </p>
                <p>
                    To use simply enter the UK Rail station name in the box above and you will be shown the current
                    boards for that station.
                </p>
                <p>
                    By clicking the destination name on those boards you will be able to view the current progress of
                    that service.
                </p>
                <h2>What's new</h2>
                <p>
                    Release notes are now available via the <a onClick={() => t.props.history.push("/releaseNotes")}>Whats
                    New</a> page.
                </p>
            </div>
        </div>);
    }

}

export default withRouter(HomePage);
