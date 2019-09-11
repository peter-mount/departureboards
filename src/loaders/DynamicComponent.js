import React, {Component} from 'react';
import Spinner from './spinner.svg';

class DynamicComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            Component: null,
        }
    }

    componentDidMount() {
        const t = this,
            props = t.props,
            importer = props.import,
            spin = props.spin;

        // Need to yield the thread before calling so any animation can start
        setTimeout(() => {
            importer().then(module => {
                this.setState({Component: module.default});
            });
            if (!spin) {
                setTimeout(() => {
                    if (t.state.Component === null) {
                        this.setState({Component: Spinner});
                    }
                }, 1000)
            }
        }, 10)
    }

    render() {
        const {Component: Component} = this.state;

        return Component ? <Component/> : <div></div>
    }
}

export default DynamicComponent
