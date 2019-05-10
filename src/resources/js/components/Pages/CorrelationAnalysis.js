import React, { Component }           from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Container, Row, Col }        from 'reactstrap';
import { Link }                       from 'react-router-dom';
import CorrelationAnalysisComponent   from '../Components/Correlation/CorrelationAnalysisComponent';

export default class CorrelationAnalysis extends Component {

    constructor (props) {
        super(props);
    }

    render () {
        return (
            <Container>
                <h1 className="my-4">Correlation Analysis</h1>
                <Breadcrumb tag="div" listTag="ol">
                    <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                    <BreadcrumbItem active>Correlation Analysis</BreadcrumbItem>
                </Breadcrumb>
                <Row>
                    <Col xs="12" className="mb-4">
                        <CorrelationAnalysisComponent/>
                    </Col>
                </Row>
            </Container>
        );
    }
}
