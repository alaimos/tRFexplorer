import React, {Component} from 'react';
import axios from 'axios';
import {Breadcrumb, BreadcrumbItem} from 'reactstrap';
import {Alert, Card, CardText, CardBody, CardFooter, CardHeader, Container, Row, Col, Button, Spinner} from 'reactstrap';
import {Form as ReactStrapForm, FormGroup, Label, Input, InputGroup} from 'reactstrap';
import {Formik, Form, ErrorMessage} from "formik";
import {Link} from "react-router-dom";
import {ChainedSelect, Field, Select} from "./ExtendedFormComponents";

const LoadingComponent = () => <div><Spinner style={{width: '3rem', height: '3rem'}}/></div>;

export default class BrowseExpressionForm extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: []
        };
    }

    setError(message) {
        this.setState({
            isLoaded: true,
            error: message,
        })
    }

    async getData() {
        try {
            const response = await axios.get('/api/browseByExpression/form_data');
            if (response.status !== 200) {
                this.setError(response.statusText);
            } else {
                const data = response.data;
                if (data.error) {
                    this.setError(data.message);
                } else {
                    this.setState({
                        isLoaded: true,
                        data: data.data,
                    });
                }
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount() {
        this.getData().catch((e) => (this.setError(e.message)));
    }

    render() {
        const data = this.state.data;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.error !== null;
        const errorMessage = this.state.error;
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
                                    <Formik>
                                        <Form>
                                            <Select name="type" addEmpty emptyText="All" options={data.types}/>
                                            <Select name="aminoacids" addEmpty emptyText="All" multiple options={data.aminoacids}/>
                                            <ChainedSelect name="anticodons" addEmpty emptyText="All" chainTo="aminoacids" emptyChained multiple
                                                           options={data.anticodonsByAminoacid}/>
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
