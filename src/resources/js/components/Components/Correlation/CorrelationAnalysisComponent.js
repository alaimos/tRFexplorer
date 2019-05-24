import React, { Component }                        from 'react';
import axios                                       from 'axios';
import { Card, CardBody, Row, Col, Button }        from 'reactstrap';
import BootstrapTable                              from 'react-bootstrap-table-next';
import filterFactory, { textFilter, customFilter } from 'react-bootstrap-table2-filter';
import paginationFactory                           from 'react-bootstrap-table2-paginator';
import { ErrorComponent, LoadingComponent }        from '../Common/CommonComponent';
//import GraphModalComponent                         from './GraphModalComponent';
import CorrelationFilter                           from './CorrelationFilter';
import styled                                      from 'styled-components';

const StyledIframe = styled.iframe`
    width: 100%;
    max-width: 600px;
    height: 450px;
    background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100% 100%"><text fill="%23FF0000" x="50%" y="50%" font-family="\\'Lucida Grande\\', sans-serif" font-size="24" text-anchor="middle">Loading...</text></svg>') 0px 0px no-repeat;
`;

export default class CorrelationAnalysisComponent extends Component {
    //showModal = null;
    state = {
        error: null,
        isLoaded: false,
        isLoadedGraph: false,
        data: null,
        datasets: null,
        graph: null,
        selectedMeasure: '',
        selectedDataset: '',
        selectedCol: '',
        selectedRow: '',
    };

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

    async getGraph () {
        try {
            this.setState({
                isLoadedGraph: false,
            });
            const response = await axios.post(
                `/api/correlation/${this.state.selectedMeasure}/dataset/${this.state.selectedDataset}/graph`,
                {
                    row: this.state.selectedRow,
                    col: this.state.selectedCol,
                });
            const graph = this.responseHandler(response);
            if (graph) {
                this.setState({
                    isLoadedGraph: true,
                    graph,
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
        if (prevState.selectedRow !== this.state.selectedRow ||
            prevState.selectedCol !== this.state.selectedCol) {
            if (this.state.selectedDataset !== '' && this.state.selectedMeasure !== '' &&
                this.state.selectedRow !== '' && this.state.selectedCol !== '') {
                this.getGraph().catch((e) => (this.setError(e.message)));
            }
        }
    }

    handleMeasureSelect = (e) => {
        const { value: selectedMeasure } = e.target;

        this.setState({
            selectedMeasure,
            selectedDataset: '',
            selectedRow: '',
            selectedCol: '',
        });
    };

    handleDatasetSelect = (e) => {
        const { value: selectedDataset } = e.target;
        this.setState({
            selectedDataset,
            selectedRow: '',
            selectedCol: '',
        });
    };

    handleGraphClick (row) {
        return () => {
            this.setState({
                selectedRow: row.rowId,
                selectedCol: row.tRF,
            });
            /*if (this.showModal && typeof this.showModal === 'function') {
                this.showModal();
            }*/
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
        const showData = selectedMeasure !== '' && selectedDataset !== '' && data !== null;
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
                                        {showModal ? (
                                            <Row className="mt-4">
                                                <Col md={12} className="text-center">
                                                    {this.state.isLoadedGraph ? (
                                                        <StyledIframe src={this.state.graph} frameBorder={0}/>
                                                    ) : (
                                                        <LoadingComponent message="Building graph..."/>
                                                    )}
                                                </Col>
                                            </Row>
                                        ) : null}
                                        <Row className="mt-4">
                                            <Col sm={12}>
                                                {!showData ? null : (
                                                    <BootstrapTable data={data} columns={tableColumns}
                                                                    pagination={paginationFactory()}
                                                                    filter={filterFactory()} keyField="key"/>
                                                )}
                                            </Col>
                                        </Row>
                                        {/*showModal ? (
                                            <GraphModalComponent col={selectedCol}
                                                                 row={selectedRow}
                                                                 correlation={selectedMeasure}
                                                                 dataset={selectedDataset}
                                                                 getShowModal={(f) => this.showModal = f}/>
                                        ) : null*/}
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
