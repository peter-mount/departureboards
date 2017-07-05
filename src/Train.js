import React, { Component } from 'react';

class Time extends Component {
    render() {
        var t = this.props.time;
        if (!t)
            return null;

        t = t.split(':');
        var s = this.props.arrived ? 'a' : ':';

        return <span className={this.props.expected ? 'expected' : 'arrived'}>{t[0] + s + t[1]}</span>;
    }
}
;

class Delay extends Component {
    render() {
        var t = this.props.delay;
        if (!t)
            return null;

        t = t.split(':');
        
        var suff='', c='delay_delayed';
        if(t[0].startsWith('-')) {
            suff='E';
            t[0]=t[0].substr(1);
            c='delay_early';
        }

        var r = t[1];
        if(t[0] !== '00' )
            r=t[0]+':'+t[1];
        
        if(r.startsWith('0'))
            r=r.substr(1);
        
        if(r==='0') {
            r='OT';
            suff='';
            c='delay_ontime';
        }
        
        return <span className={c}>{r+suff}</span>;
    }
}
;

class Location extends Component {
    render() {
        var tpl = this.props.data.tiploc[this.props.tiploc];
        return <span className="tiploc">{tpl ? tpl.name : this.props.tiploc}</span>;
    }
}
;

class Movement extends Component {
    render() {
        var row = this.props.row;
        var data = this.props.data;
        var lrid = this.props.lrid;
        var c1 = 'expt', c2=c1;
        if(row.wtp)
            c1=c2= 'pass';
        if(row.dep || row.arr) {
            c1= 'arr';
            c2= 'arrived';
        }

        // Show icon only if we are the last id
        var icon = lrid===row.id && !row.dep ?<i className="fa fa-train" aria-hidden="true"></i>:null;
        
        return <tr key={'r'+row.id}>
                                                    <td className="ldb-fsct-stat">{icon}</td>
                                                        <td className={'ldb-fsct-loc-' + c1}>
                                                <Location data={data} tiploc={row.tpl}/>
                                                </td>
                                                <td className={'ldb-fsct-plat-' + c1}> {row.wtp?'Pass':row.platsup ? null : row.plat} </td>
                                                <td className={'ldb-fsct-' + c2}>
                                                    {row.dep ? <Time time={row.dep}/> : row.arr ? <Time time={row.arr} arrived="true"/> : <Time time={row.expectedTime} expected="true"/>}
                                                </td>
                                                <td className={'ldb-fsct-' + c2}><Delay delay={row.delay}/></td>
                                                </tr>;

    }
};

class Info extends Component {
    render() {
        var val = this.props.value;
        if(val && this.props.linkPrefix)
            val=<a href={this.props.linkPrefix+val}>{val}</a>;
        
        return this.props.value === null || this.props.value === undefined
                ? null
                : <div className="ldb-row">
                    <div className="ldb-label">{this.props.label}</div>
                    <div className="ldb-value">{val}</div>
                </div>;
    }
}
;

class Train extends Component {
    state = {
        hide: true
    };

    constructor(props) {
        super(props);
        console.log('Train', props);
        window.history.replaceState({}, '', '?' + props.rid);
        this.refresh(this);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    refresh(t) {
        t.timer = setTimeout(() => t.refresh(t), 60000 /*t.props.app.config.refreshRate*/);
        fetch('https://api.area51.onl/rail/2/darwin/rtt/' + t.props.rid)
                .then(res => res.json())
                .then(json => {
                    t.setState({
                        hide: false,
                        data: json
                    });
                })
                .catch(e => {
                    // Retry in 5 seconds
                    clearTimeout(this.timer);
                    t.timer = setTimeout(() => t.refresh(t), 5000);
                    t.setState({
                        hide: true
                    });
                });
    }

    render() {
        console.log(this.state);
        if (this.state.hide)
            return <div>
                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                <span className="sr-only">Loading...</span>
            </div>;

        var data = this.state.data,
                schedule = data.schedule ? data.schedule : {};

    // Id of last report
    var lrid = data.lastReport ? data.lastReport.id : -1;

        return <div id="board">
            <div className="App-header">
                <Location data={data} tiploc={data.destination.tpl}/> <span className='ldbVia'>{data.via}</span>
            </div>
            <div className="ldbWrapper">
                <div className="ldb-row">
                    <table>
                        <thead>
                            <tr>
                                <th>&nbsp;</th>
                                <th>Location</th>
                                <th>Plat</th>
                                <th>Time</th>
                                <th>Delay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.movement
                                                ? data.movement
                                                // We don't show passes unless last report or next pass after last report
                                                .filter(row => lrid===row.id || (lrid+1)===row.id || !(row.pass || row.wtp))
                                                .reduce((a, row) => {
                                                    a.push(<Movement key={'r'+row.id} data={data} row={row} lrid={lrid}/>);
                                            if(row.id===lrid && row.dep)
                                                a.push(<tr key={'r'+row.id+"a"}>
                                                            <td className="ldb-fsct-stat">
                                                                <i className="fa fa-train" aria-hidden="true"></i>
                                                            </td>
                                                        </tr>);
                                            return a;
                        },[])
                        :null
                        }
                        </tbody>
                    </table>
                </div>
                <div className="ldb-row"> Forms the <a href="/train/201707058783424"> 11:22 </a> 
                    <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> <a href="/train/201707058783424"> </a> 
                    <a href="/train/201707058783424"> to Canterbury&nbsp;West due 13:27 </a>
                </div>
                <Info label="Head code" value={schedule.trainId}/>
                <Info label="Operator" value={schedule.toc ? schedule.toc.name : null}/>
                <Info label="Last Report" value={data.lastReport
                                        ? [
                                            <Location key='lr' data={data} tiploc={data.lastReport.tpl}/>,
                                            ' at ',
                                            data.lastReport.actualTime
                                        ]
                                        : null
                    }/>
                    <Info label="UID" value={schedule.uid}/>
                    <Info label="RID" value={data.rid} linkPrefix="//uktra.in/rtt/train/"/>
                    <Info label="Generated" value={data.generatedTime}/>
            </div>
        </div>;
            }

        }

        export default Train;
