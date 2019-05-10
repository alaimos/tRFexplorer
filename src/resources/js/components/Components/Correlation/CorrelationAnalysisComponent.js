import PropTypes                                   from 'prop-types';
import React, { Component }                        from 'react';
import axios                                       from 'axios';
import { Card, CardBody, Row, Col, Button, Alert } from 'reactstrap';
import BootstrapTable
                                                   from 'react-bootstrap-table-next';
import filterFactory, { textFilter, customFilter } from 'react-bootstrap-table2-filter';
import paginationFactory
                                                   from 'react-bootstrap-table2-paginator';
import { Link }                                    from 'react-router-dom';
import { ErrorComponent, LoadingComponent }        from '../Common/CommonComponent';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Tooltip                                     from 'rc-tooltip';
import Slider                                      from 'rc-slider';
import GraphModalComponent                         from './GraphModalComponent';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Handle = Slider.Handle;

const handleTooltip = ({ value, dragging, index, ...restProps }) => {
    return (
        <Tooltip prefixCls="rc-slider-tooltip" overlay={value} visible={dragging} placement="top" key={index}>
            <Handle value={value} {...restProps} />
        </Tooltip>
    );
};

class CorrelationFilter extends React.Component {
    static propTypes = {
        onFilter: PropTypes.func.isRequired,
    };

    constructor (props) {
        super(props);
        this.state = {
            sliderValue: 0.5,
        };
    }

    componentDidMount () {
        const { getFilter } = this.props;
        if (getFilter) {
            getFilter((v) => {
                this.setState({
                    sliderValue: v,
                });
            });
        }
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (prevState.sliderValue !== this.state.sliderValue) {
            this.props.onFilter(this.state.sliderValue);
        }
    }

    filter = (v) => {
        this.setState({
            sliderValue: v,
        });
    };

    render () {
        return (
            <Slider min={0.5} max={1.0} defaultValue={0.5} value={this.state.sliderValue} step={0.01}
                    handle={handleTooltip} onChange={this.filter}/>
        );
    }
}

export default class CorrelationAnalysisComponent extends Component {

    constructor (props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: null,
            datasets: null,
            selectedMeasure: '',
            selectedDataset: '',
            selectedCol: '',
            selectedRow: '',
        };
    }

    static buildSelectOptions (data) {
        const tmp = Object.entries(data).map(([k, v]) => (
            <option value={k} key={k}>{v}</option>
        ));
        tmp.unshift(<option value={''} key="__EMPTY__"/>);
        return tmp;
    }

    setError (message) {
        this.setState({
            isLoaded: true,
            error: message,
        });
    }

    responseHandler (response) {
        if (response.status !== 200) {
            this.setError(response.statusText);
        } else {
            const data = response.data;
            if (data.error) {
                this.setError(data.message);
            } else {
                return data.data;
            }
        }
        return null;
    }

    async getDatasets () {
        try {
            const response = await axios.get('/api/correlation');
            const datasets = this.responseHandler(response);
            if (datasets) {
                this.setState({
                    isLoaded: true,
                    datasets,
                });
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    async getData () {
        const m = this.state.selectedMeasure;
        const d = this.state.selectedDataset;
        try {
            this.setState({
                isLoaded: false,
            });
            const response = await axios.get(`/api/correlation/${m}/dataset/${d}`);
            const data = this.responseHandler(response);
            if (data) {
                this.setState({
                    isLoaded: true,
                    data,
                });
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount () {
        this.getDatasets().catch((e) => (this.setError(e.message)));
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (prevState.selectedDataset !== this.state.selectedDataset ||
            prevState.selectedMeasure !== this.state.selectedMeasure) {
            if (this.state.selectedDataset !== '' && this.state.selectedMeasure !== '') {
                this.getData().catch((e) => (this.setError(e.message)));
            }
        }
    }

    handleMeasureSelect = (e) => {
        const { value: selectedMeasure } = e.target;
        this.setState({ selectedMeasure });
    };

    handleDatasetSelect = (e) => {
        const { value: selectedDataset } = e.target;
        this.setState({ selectedDataset });
    };

    handleGraphClick (row) {
        return () => {
            this.setState({
                selectedCol: row.tRF,
                selectedRow: row.rowId,
            });
        };
    }

    render () {
        const isLoaded = this.state.isLoaded;
        const errorMessage = this.state.error;
        const isError = errorMessage !== null;
        const selectedMeasure = this.state.selectedMeasure;
        const selectedDataset = this.state.selectedDataset;
        const selectedCol = this.state.selectedCol;
        const selectedRow = this.state.selectedRow;
        const showModal = (selectedCol !== '' && selectedRow !== '' &&
                           selectedMeasure !== '' && selectedDataset !== '');
        const data = this.state.data;
        const hasData = data !== null;
        const tableColumns = [
            {
                dataField: 'tRF',
                text: 'Fragment',
                filter: textFilter(),
                headerStyle: { verticalAlign: 'top' },
                sort: true,
            }, {
                dataField: 'name',
                text: 'Correlated with',
                headerStyle: { verticalAlign: 'top' },
                filter: textFilter(),
                sort: true,
            }, {
                dataField: 'position',
                text: 'Genomic Position',
                sort: true,
                headerStyle: { verticalAlign: 'top' },
                filter: textFilter(),
            }, {
                dataField: 'correlation',
                text: 'Correlation',
                sort: true,
                headerStyle: { verticalAlign: 'top' },
                filter: customFilter({
                    onFilter: (val) => data.filter(d => Math.abs(d.correlation) >= val),
                }),
                filterRenderer: (onFilter) => <CorrelationFilter onFilter={onFilter}/>,
            }, {
                dataField: 'action',
                text: 'Action',
                sort: false,
                isDummyField: true,
                formatter: (cell, row) => (
                    <Button size="sm" color="outline-info" onClick={this.handleGraphClick(row)}>
                        <i className="fas fa-chart-line"/>
                    </Button>
                ),
            }];
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Card>
                        <CardBody>
                            {isLoaded ? (
                                isError ? (
                                    <ErrorComponent errorMessage={errorMessage}/>
                                ) : (
                                    <React.Fragment>
                                        <Row>
                                            <Col sm={6} className="text-center">
                                                <strong>Select a correlation measure:</strong><br/>
                                                <select value={selectedMeasure} name="measure-selector"
                                                        className="form-control" onChange={this.handleMeasureSelect}>
                                                    {CorrelationAnalysisComponent.buildSelectOptions(
                                                        this.state.datasets.measures)}
                                                </select>
                                            </Col>
                                            <Col sm={6} className="text-center">
                                                <strong>Select a dataset:</strong><br/>
                                                <select value={selectedDataset} name="dataset-selector"
                                                        disabled={selectedMeasure === ''}
                                                        className="form-control" onChange={this.handleDatasetSelect}>
                                                    {CorrelationAnalysisComponent.buildSelectOptions(
                                                        this.state.datasets.datasetsByMeasure[selectedMeasure] || [])}
                                                </select>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col sm={12} className="mt-4">
                                                {!hasData ? null : (
                                                    <BootstrapTable data={data} columns={tableColumns}
                                                                    pagination={paginationFactory()}
                                                                    filter={filterFactory()} keyField="key"/>
                                                )}
                                            </Col>
                                        </Row>
                                        {showModal ? (
                                            <GraphModalComponent col={selectedCol}
                                                                 row={selectedRow}
                                                                 correlation={selectedMeasure}
                                                                 dataset={selectedDataset}/>
                                        ) : null}
                                    </React.Fragment>
                                )
                            ) : (
                                <LoadingComponent/>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }
}
