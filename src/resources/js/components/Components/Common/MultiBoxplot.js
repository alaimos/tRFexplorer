import PropTypes                     from 'prop-types';
import React                         from 'react';
import { Row, Col }                  from 'reactstrap';
import ScrollableAnchor, { goToTop } from 'react-scrollable-anchor';
import Plot                          from 'react-plotly.js';
import { LoadingComponent }          from './CommonComponent';
import Alert                         from 'reactstrap/es/Alert';

export default class MultiBoxplot extends React.Component {

    static propTypes = {
        data: PropTypes.array.isRequired,
        clinical: PropTypes.object.isRequired,
    };

    constructor (props) {
        super(props);
        this.state = {
            selectedVariable: '',
        };
    }

    getValidKeys () {
        return Object.keys(this.props.clinical).filter(k => k !== 'samples');
    }

    makeBoxplotTraces () {
        const keys = this.getValidKeys();
        const selected = this.state.selectedVariable || keys[0];
        const clinical = this.props.clinical[selected];
        const ys = {};
        const x = [];
        for (let i = 0; i < this.props.data.length; i++) {
            if (clinical[i] !== null && this.props.data[i] !== null) {
                if (ys[clinical[i]] === undefined) {
                    ys[clinical[i]] = [];
                    x.push(clinical[i]);
                }
                ys[clinical[i]].push(this.props.data[i]);
            }
        }
        x.sort();
        return x.map(k => {
            const y = ys[k];
            return {
                y,
                name: k,
                boxpoints: false,
                visible: true,
                type: 'box',
            };
        });
    }

    onChangeHandler = (e) => {
        this.setState({
            selectedVariable: e.target.value,
        });
    };

    render () {
        const selectedVariable = this.state.selectedVariable;
        const keys = this.getValidKeys();
        const layout = {
            autosize: true,
        };
        return (
            <Row>
                <Col xs={12} className="text-center">
                    <Row>
                        <Col xs={12} md={{ size: 4, offset: 4 }}>
                            <select value={selectedVariable} onChange={this.onChangeHandler} className="form-control">
                                <option key="__EMPTY__" value="">Select a clinical variable</option>
                                {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="mt-4">
                            {selectedVariable === '' ? (
                                <Alert color="info">Please select a clinical variable to generate a graph.</Alert>
                            ) : (
                                <Plot data={this.makeBoxplotTraces()} layout={layout} useResizeHandler style={{
                                    width: '100%',
                                    height: '100%',
                                }}/>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
