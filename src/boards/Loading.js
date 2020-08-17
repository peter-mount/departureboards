import React, {Component} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faToilet} from '@fortawesome/free-solid-svg-icons/faToilet'

class Loading extends Component {

    render() {
        const props = this.props,
            rid = props.rid,
            loading = props.loading,
            formation = props.formation;

        let ary = [];
        if (loading) {
            ary = loading.loading;
            if (formation.rid === rid) {
                for (let coach of formation.formation.coaches) {
                    let c = ary.find(v => v.coachNumber === coach.coachNumber);
                    if (!c) {
                        // TODO how to sort out the true order, this will put unknown entries at the end
                        c = {coachNumber: coach.coachNumber}
                        ary.push(c)
                    }
                    c.coachClass = coach.coachClass;
                    c.toilet = coach.toilet;
                }
            }
        } else if (formation.rid === rid) {
            ary = formation.formation.coaches
        } else {
            // Should not happen
            return <span></span>
        }

        let coaches = [],
            icon = "cab";

        for (let coach of ary) {
            const loadingLevel = coach.loading,
                cclass = coach.coachClass,
                toilet = coach.toilet,
                toiletType = toilet.type,
                load = !loadingLevel && loadingLevel !== 0 ? "load-unknown"
                    : loadingLevel >= 70 ? "load-high"
                        : loadingLevel >= 30 ? "load-med"
                            : "load-low",
                loading = !loadingLevel && loadingLevel !== 0 ? "" :
                    <span className="coach-info">{loadingLevel}%</span>,
                coachClass = cclass === "Mixed" || cclass === "First"
                    ? <span className="coach-class"><i className="material-icons">looks_one</i></span>
                    : "";

            let coachToilet;
            switch (toiletType) {
                case "Standard":
                    coachToilet = <span className="coach-toilet"><FontAwesomeIcon icon={faToilet}/></span>;
                    break;
                case "Accessible":
                    coachToilet = <span className="coach-toilet"><i className="material-icons">accessible</i></span>;
                    break;
                default:
                    coachToilet = <span className="coach-toilet">&nbsp;</span>;
                    break;
            }

            coaches.push(<div key={"coach" + coach.coachNumber} className={["ci", icon, load].join(' ')}>
                {coachClass}{loading}{coachToilet}
            </div>);

            icon = "coach"
        }

        return <div className="ldb-entbot">{coaches}</div>
    }
}

export default Loading;
