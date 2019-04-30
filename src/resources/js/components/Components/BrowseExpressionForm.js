import PropTypes                                            from 'prop-types';
import React, { Component }                                 from 'react';
import axios                                                from 'axios';
import { Alert, Card, CardBody, Row, Col, Button, Spinner } from 'reactstrap';
import { FormGroup, Label }                                 from 'reactstrap';
import { Formik, Form }                                     from 'formik';
import { ChainedSelect, Field, Select, ErrorMessage }       from './ExtendedFormComponents';

const LoadingComponent = () => (
    <div className="text-center">
        <Spinner style={{ width: '3rem', height: '3rem' }}/>
    </div>
);

export default class BrowseExpressionForm extends Component {

    static propTypes = {
        submitHandler: PropTypes.func.isRequired,
    };

    constructor (props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: [],
        };
        this.initialFormState = {
            tRFType: '',
            aminoacids: [''],
            anticodons: [''],
            dataset: [''],
            tissueType: [''],
            minRPM: 1,
        };
    }

    setError (message) {
        this.setState({ isLoaded: true, error: message });
    }

    async getData () {
        try {
            const response = await axios.get('/api/browseByExpression');
            if (response.status !== 200) {
                this.setError(response.statusText);
            } else {
                const data = response.data;
                if (data.error) {
                    this.setError(data.message);
                } else {
                    this.setState({ isLoaded: true, data: data.data });
                }
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount () {
        this.getData().catch(e => this.setError(e.message));
    }

    render () {
        const data = this.state.data;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.error !== null;
        const errorMessage = this.state.error;
        const initialFormState = this.initialFormState;
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Card>
                        <CardBody>
                            {isLoaded ? (
                                isError ? (
                                    <Alert color="danger">
                                        <h4 className="alert-heading">
                                            Error!
                                        </h4>
                                        <p>{errorMessage}</p>
                                    </Alert>
                                ) : (
                                    <Formik initialValues={initialFormState}
                                            onSubmit={this.props.submitHandler}>
                                        <Form>
                                            <Row>
                                                <Col md={6}>
                                                    <Row>
                                                        <Col md={12}>
                                                            <FormGroup>
                                                                <Label
                                                                    for="tRFType">Filter
                                                                    by fragment
                                                                    type</Label>
                                                                <Select
                                                                    name="tRFType"
                                                                    addEmpty
                                                                    emptyText="All"
                                                                    options={data.types}/>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm={6}>
                                                            <FormGroup>
                                                                <Label
                                                                    for="aminoacids">Filter
                                                                    by
                                                                    aminoacid</Label>
                                                                <Select
                                                                    name="aminoacids"
                                                                    addEmpty
                                                                    emptyText="All"
                                                                    multiple
                                                                    options={data.aminoacids}/>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={6}>
                                                            <FormGroup>
                                                                <Label
                                                                    for="anticodons">Filter
                                                                    by
                                                                    anticodon</Label>
                                                                <ChainedSelect
                                                                    name="anticodons"
                                                                    addEmpty
                                                                    emptyText="All"
                                                                    chainTo="aminoacids"
                                                                    emptyChained
                                                                    multiple
                                                                    options={data.anticodonsByAminoacid}/>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col md={6}>
                                                    <Row>
                                                        <Col sm={6}>
                                                            <FormGroup>
                                                                <Label
                                                                    for="dataset">Filter
                                                                    by
                                                                    dataset</Label>
                                                                <Select size="9"
                                                                        name="dataset"
                                                                        addEmpty
                                                                        emptyText="All"
                                                                        multiple
                                                                        options={data.datasets}/>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={6}>
                                                            <FormGroup>
                                                                <Label
                                                                    for="tissueType">Filter
                                                                    by tissue
                                                                    type</Label>
                                                                <ChainedSelect
                                                                    size="9"
                                                                    name="tissueType"
                                                                    addEmpty
                                                                    emptyText="All"
                                                                    chainTo="dataset"
                                                                    emptyChained
                                                                    multiple
                                                                    options={data.tissueTypesByDataset}/>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={12}>
                                                    <FormGroup>
                                                        <Label for="minRPM">
                                                            Minimum RPM value
                                                        </Label>
                                                        <Field name="minRPM"
                                                               type="number"/>
                                                        <ErrorMessage
                                                            name="minRPM"/>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <FormGroup check row>
                                                <Col sm={12}
                                                     className="text-center">
                                                    <Button type="submit">
                                                        Submit
                                                    </Button>
                                                </Col>
                                            </FormGroup>
                                        </Form>
                                    </Formik>
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
