import React, { Component } from 'react';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

class Stations extends Component {

    state = {
        options: []
    };

    componentDidMount() {
        //this.focus.focus();
        this.setState({options: []});
    }

    // Perform the query
    search(query, t) {
        console.log(query);
        fetch('https://api.area51.onl/rail/2/search/' + query)
                .then(resp => resp.json())
                .then(json => {
                    console.log(json);
                    return json;
                })
                .then(json => t.setState({
                        options: json
                    }))
                .then(json => {
                    console.log(t.state);
                }
                );
    }

    // Handle the selection. Only pass 1 entry to the app
    select(selection, t) {
        if (selection && selection.length === 1)
            t.props.app.boards(selection[0], t.props.app);
    }

    render() {
        return <div>
            <div className="App-header"><h2>Welcome to the new UK Departure Boards</h2></div>
            <div className="App-intro">
                <div className="station-form">
                    <div>
                        <div id="stationlabel" htmlFor="stations">Please enter the station you want to view below: </div>
                        <AsyncTypeahead
                            id="stations"
                            useCache={false}
                            minLength={3}
                            onSearch={query => this.search(query, this)}
                            onChange={selection => this.select(selection, this)}
                            options={this.state.options}
                            placeholder="Type a station name, postcode or CRS code"
                            ref={(input) => this.focus = input}
                            filterBy={(o, t) => true}
                            />
                    </div>
                </div>
                <p>
                    Live departure boards for every UK Rail Station in a mobile friendly format by the
                    team behind <a href="https://twitter.com/TrainWatch">@TrainWatch</a> and <a href="//uktra.in/">uktra.in</a>.
                </p>
                <p>
                    To use simply enter the UK Rail station name in the box above and you will be shown the current boards for that station.
                </p>
                <p>
                    Alternatively you can enter a UK PostCode and you will be shown the nearest stations to that address.
                </p>
                <p>
                    By clicking the destination name on those boards you will be able to view the current progress of that service.
                </p>
            </div>
        </div>;
    }

}
;

export default Stations;