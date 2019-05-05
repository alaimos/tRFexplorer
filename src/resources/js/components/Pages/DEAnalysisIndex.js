import PropTypes                                                             from 'prop-types';
import React, { Component }                                                  from 'react';
import { Breadcrumb, BreadcrumbItem }                                        from 'reactstrap';
import { Card, CardText, CardBody, CardHeader, Container, Row, Col, Button } from 'reactstrap';
import { Link }                                                              from 'react-router-dom';
import DEAnalysisForm                                                        from '../Components/DE/DEAnalysisForm';
import { LoadingComponent }                                                  from '../Components/Common/CommonComponent';

export default class DEAnalysisIndex extends Component {

    constructor (props) {
        super(props);
        this.state = {
            formData: null,
            isSubmitted: false,
        };
    }

    handleFormSubmit = (values) => {
        this.setState({
            formData: values,
            isSubmitted: true,
        });
        console.log(values);
    };

    render () {
        const isSubmitted = this.state.isSubmitted;
        return (
            <Container>
                <h1 className="my-4">Differential Expression Analysis</h1>
                <Breadcrumb tag="div" listTag="ol">
                    <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                    <BreadcrumbItem active>Differential Expression Analysis</BreadcrumbItem>
                </Breadcrumb>
                <Row>
                    <Col xs="12" className="mb-4">
                        {isSubmitted ? (
                            <LoadingComponent message="Submitting..."/>
                        ) : (
                            <DEAnalysisForm submitHandler={this.handleFormSubmit}/>
                        )}
                    </Col>
                </Row>
            </Container>
        );
    }
}
