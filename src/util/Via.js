import React, {Component} from 'react';

/*
 * Handles the rendering of a Via
 *
 * Properties:
 * via    Via object to render or null
 *
 * This returns null if reason is null, code 0 or reasons map is not present.
 */
class Via extends Component {
    render() {
        const p = this.props,
            v = p.via;
        if (v && v.text) {
            return <span className="ldb-entbot">{v.text}</span>;
        }
        return null;
    }
}

export default Via;
