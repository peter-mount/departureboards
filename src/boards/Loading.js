import React, {Component} from 'react';

class Loading extends Component {

    render() {
        const props = this.props,
            data = props.data,
            loading = props.loading;

        let coaches = [],
            icon = "cab";

        for (let coach of loading.loading) {
            const loading = coach.loading,
                load = loading >= 74 ? "load-full"
                    : loading >= 50 ? "load-high"
                        : loading >= 25 ? "load-med"
                            : "load-low"

            coaches.push(<div key={"coach" + coach.coachNumber} className={["ci", icon, load].join(' ')}>
                <span className="coach-info">{loading}%</span>
            </div>);

            icon = "coach"
        }

        console.log(coaches)

        return <div className="ldb-entbot">{coaches}</div>
    }
}

export default Loading;
