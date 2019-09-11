import React, {Component} from 'react';

class BoardsLoader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            Component: null,
        }
    }

    componentDidMount() {
        //
        // Ignore the warning about:
        //
        // System.import() is deprecated and will be removed soon. Use import() instead.
        // For more info visit https://webpack.js.org/guides/code-splitting/
        //
        // This is due to currently using just import (remove System.) causes the comment to be
        // stripped out & everything get's put into a single chunk.
        //
        System.import( /* webpackChunkName: "boards" webpackPrefetch: -100 */ '../boards/Boards')
            .then(module => {
                this.setState({Component: module.default});
            });
    }

    render() {
        const {Component} = this.state;

        return Component
            ? <Component/>
            : <h3>Loading...</h3>
    }
}

export default BoardsLoader;
