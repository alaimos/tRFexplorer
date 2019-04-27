import React, {Component} from 'react';
import axios from 'axios';
import {Alert, Card, CardBody, Row, Col, Button, Spinner} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, {textFilter, selectFilter} from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {Link} from "react-router-dom";

const LoadingComponent = () => <div className="text-center"><Spinner style={{width: '3rem', height: '3rem'}}/></div>;

export default class SearchByExpression extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: [],
            types: {},
        };
    }

    setError(message) {
        this.setState({
            isLoaded: true,
            error: message,
        })
    }

    static cleanParameterArray(searchParameter, name) {
        let tmp = searchParameter[name] || [];
        return (tmp.includes("") || tmp.length === 0) ? "" : tmp;
    }

    static parseSearchParameters(searchParameters) {
        const parameters = {...searchParameters};
        parameters.tRFType = parameters.tRFType || "";
        parameters.aminoacids = this.cleanParameterArray(searchParameters, "aminoacids");
        parameters.anticodons = this.cleanParameterArray(searchParameters, "anticodons");
        parameters.dataset = this.cleanParameterArray(searchParameters, "dataset");
        parameters.tissueType = this.cleanParameterArray(searchParameters, "tissueType");
        parameters.minRPM = parameters.minRPM || 0;
        return parameters;
    }

    responseHandler(response) {
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

    async getSearchResult() {
        try {
            const searchParameters = SearchByExpression.parseSearchParameters(this.props.searchParameters);
            const response = await axios.post('/api/browseByExpression', searchParameters);
            const data = this.responseHandler(response);
            if (data) {
                const response1 = await axios.get('/api/browseByExpression/types');
                const types = this.responseHandler(response1);
                if (types) {
                    this.setState({
                        isLoaded: true,
                        data,
                        types,
                    });
                }
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount() {
        this.getSearchResult().catch((e) => (this.setError(e.message)));
    }

    render() {
        const data = this.state.data;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.error !== null;
        const errorMessage = this.state.error;
        const columns = [{
            dataField: 'name',
            text: 'Fragment',
            filter: textFilter(),
            sort: true,
        }, {
            dataField: 'type',
            text: 'Fragment Type',
            filter: selectFilter({
                options: this.state.types
            }),
            sort: true,
        }, {
            dataField: 'aminoacids',
            text: 'Aminoacids',
            sort: true,
            filter: textFilter(),
            formatter: (cell) => {
                if (!Array.isArray(cell)) {
                    cell = [cell]
                }
                return cell.join(", ");
            }
        }, {
            dataField: 'anticodons',
            text: 'Anticodons',
            sort: true,
            filter: textFilter(),
            formatter: (cell) => {
                if (!Array.isArray(cell)) {
                    cell = [cell]
                }
                return cell.join(", ");
            }
        }, {
            dataField: 'action',
            text: 'Action',
            sort: false,
            isDummyField: true,
            formatter: (cell, row) => {
                return <Link to={"/fragments/" + row.id} className="btn btn-sm btn-outline-info"><i className="fas fa-info-circle" /> Details</Link>;
            }
        }];
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Card>
                        <CardBody>
                            {isLoaded ? (
                                isError ? (
                                    <Alert color="danger">
                                        <h4 className="alert-heading">Error!</h4>
                                        <p>{errorMessage}</p>
                                    </Alert>
                                ) : (
                                    <BootstrapTable
                                        data={data}
                                        columns={columns}
                                        pagination={paginationFactory()}
                                        filter={filterFactory()}
                                        keyField="id"
                                    />
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
