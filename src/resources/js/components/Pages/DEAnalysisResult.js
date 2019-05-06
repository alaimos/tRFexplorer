import PropTypes                                                             from 'prop-types';
import React, { Component }                                                  from 'react';
import { Breadcrumb, BreadcrumbItem }                                        from 'reactstrap';
import { Card, CardText, CardBody, CardHeader, Container, Row, Col, Button } from 'reactstrap';
import { Link }                                                              from 'react-router-dom';
import TRFComponent                                                          from '../Components/Browse/TRFComponent';
import DEResultsView                                                         from '../Components/DE/DEResultsView';

export default class DEAnalysisResult extends Component {

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    };

    constructor (props) {
        super(props);
    }

    render () {
        return <Container>
            <h1 className="my-4">Results</h1>
            <Breadcrumb tag="div" listTag="ol">
                <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                <BreadcrumbItem><Link to="/de-analysis">Differential Expression Analysis</Link></BreadcrumbItem>
                <BreadcrumbItem active>Results</BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col xs="12" className="mb-4">
                    <DEResultsView analysisId={this.props.match.params.id}/>
                </Col>
            </Row>
        </Container>;
    }
}
