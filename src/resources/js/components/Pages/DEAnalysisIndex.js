import React, { Component }                 from 'react';
import { Breadcrumb, BreadcrumbItem }       from 'reactstrap';
import { Container, Row, Col }              from 'reactstrap';
import { Link, Redirect }                   from 'react-router-dom';
import DEAnalysisForm                       from '../Components/DE/DEAnalysisForm';
import { ErrorComponent, LoadingComponent } from '../Components/Common/CommonComponent';
import axios                                from 'axios';

export default class DEAnalysisIndex extends Component {

    constructor (props) {
        super(props);
        this.state = {
            analysisId: null,
            isSubmitting: false,
            isSubmitted: false,
            error: null,
        };
    }

    setError (message) {
        this.setState({
            isSubmitting: true,
            isSubmitted: true,
            error: message,
        });
    }

    async processDE (values) {
        try {
            const response = await axios.post('/api/de/analysis', values);
            if (response.status !== 200) {
                this.setError(response.statusText);
            } else {
                const data = response.data;
                if (data.error) {
                    this.setError(data.message);
                } else {
                    this.setState({
                        isSubmitting: true,
                        isSubmitted: true,
                        analysisId: data.data,
                    });
                }
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    handleFormSubmit = (values) => {
        this.setState({
            isSubmitting: true,
            isSubmitted: false,
        });
        this.processDE(values).catch(e => this.setError(e.message));
    };

    render () {
        const isSubmitted = this.state.isSubmitted;
        const isSubmitting = this.state.isSubmitting;
        const isError = this.state.error !== null;
        return (
            <Container>
                <h1 className="my-4">Differential Expression Analysis</h1>
                <Breadcrumb tag="div" listTag="ol">
                    <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                    <BreadcrumbItem active>Differential Expression Analysis</BreadcrumbItem>
                </Breadcrumb>
                <Row>
                    <Col xs="12" className="mb-4">
                        {isSubmitting ? (
                            isSubmitted ? (
                                isError ? (
                                    <ErrorComponent errorMessage={this.state.error}/>
                                ) : (
                                    <Redirect to={`/de-analysis/${this.state.analysisId}`}/>
                                )
                            ) : (
                                <LoadingComponent message="Submitting..."/>
                            )
                        ) : (
                            <DEAnalysisForm submitHandler={this.handleFormSubmit}/>
                        )}
                    </Col>
                </Row>
            </Container>
        );
    }
}
