import PropTypes                                      from 'prop-types';
import React, { Component }                           from 'react';
import axios                                          from 'axios/index';
import { Card, CardBody, Row, Col, Button }           from 'reactstrap';
import { FormGroup, Label }                           from 'reactstrap';
import { Formik, Form, connect, getIn }               from 'formik/dist/index';
import { ChainedSelect, Field, Select, ErrorMessage } from '../Common/ExtendedFormComponents';
import { ErrorComponent, LoadingComponent }           from '../Common/CommonComponent';
import Alert                                          from 'reactstrap/es/Alert';

const makeContrasts = (dataset, variables, valuesByDatasetAndVariable) => {
    if (variables.length > 0) {
        let variable = variables.shift();
        let contrasts = { ...valuesByDatasetAndVariable[dataset][variable] };
        let values = null;
        while (variables.length > 0) {
            variable = variables.shift();
            values = valuesByDatasetAndVariable[dataset][variable];
            let newContrasts = {};
            for (const value of Object.values(values)) {
                for (const contrast of Object.values(contrasts)) {
                    newContrasts[contrast + ' ' + value] = contrast + ' ' + value;
                }
            }
            contrasts = newContrasts;
        }
        return contrasts;
    }
    return null;
};

const ContrastsAwareComponents = connect(({ formik, valuesByDatasetAndVariable, children, ...props }) => {
    const dataset = getIn(formik.values, 'dataset') || '';
    const variables = getIn(formik.values, 'variables') || [];
    const contrasts = makeContrasts(dataset, variables, valuesByDatasetAndVariable);
    return children(contrasts, props);
});

export default class DEAnalysisForm extends Component {

    static propTypes = {
        submitHandler: PropTypes.func.isRequired,
    };

    constructor (props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: [],
            contrasts: null,
        };
        this.initialFormState = {
            dataset: '',
            variables: [],
            contrasts: [],
        };
    }

    setError (message) {
        this.setState({ isLoaded: true, error: message });
    }

    async getData () {
        try {
            const response = await axios.get('/api/data/clinical/de');
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
        const contrasts = this.state.contrasts;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.error !== null;
        const initialFormState = this.initialFormState;
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Card>
                        <CardBody>
                            {isLoaded ? (
                                isError ? (
                                    <ErrorComponent errorMessage={this.state.error}/>
                                ) : (
                                    <Formik initialValues={initialFormState} onSubmit={this.props.submitHandler}>
                                        <Form>
                                            <Row>
                                                <Col md={6}>
                                                    <FormGroup>
                                                        <Label for="dataset">Select a dataset:</Label>
                                                        <Select name="dataset" addEmpty options={data.datasets}/>
                                                    </FormGroup>
                                                </Col>
                                                <Col md={6}>
                                                    <FormGroup>
                                                        <Label for="variables">Select one or more variables:</Label>
                                                        <ChainedSelect name="variables"
                                                                       chainTo="dataset"
                                                                       emptyChained={false} multiple
                                                                       options={data.variablesByDataset}/>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm={12}>
                                                    <ContrastsAwareComponents
                                                        valuesByDatasetAndVariable={this.state.data.valuesByDatasetAndVariable}>{
                                                        (contrasts) => (
                                                            contrasts === null ? (
                                                                <Alert color="info">
                                                                    Select variables before proceeding with contrasts.
                                                                </Alert>
                                                            ) : (
                                                                null
                                                            )
                                                        )
                                                    }</ContrastsAwareComponents>
                                                </Col>
                                            </Row>
                                            <FormGroup check row>
                                                <Col sm={12}
                                                     className="text-center">
                                                    <Button type="submit" disabled={contrasts === null}>
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
