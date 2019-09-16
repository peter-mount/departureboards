import React, {Component} from 'react';
import DynamicComponent from "./DynamicComponent";

class ConfigPageLoader extends Component {
    //
    // Ignore the warning about:
    //
    // System.import() is deprecated and will be removed soon. Use import() instead.
    // For more info visit https://webpack.js.org/guides/code-splitting/
    //
    // This is due to currently using just import (remove System.) causes the comment to be
    // stripped out & everything get's put into a single chunk.
    //
    render() {
        return <DynamicComponent
            import={() => System.import( /* webpackChunkName: "config" */ '../config/ConfigPage')}
        />
    }
}

export default ConfigPageLoader;
