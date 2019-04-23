import React, {Component} from 'react';
import axios from 'axios';
import {Breadcrumb, BreadcrumbItem} from 'reactstrap';
import {Card, CardText, CardBody, CardFooter, CardHeader, Container, Row, Col, Button, Spinner} from 'reactstrap';
import {Link} from "react-router-dom";

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

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                isLoaded: true,
            });
        }, 2000);
    }

    render() {
        var isLoaded = this.state.isLoaded;
        return (
            <Row>
                <Col xs="12" className="mb-4 text-center">
                    {isLoaded ? (
                        null
                    ) : (
                        <LoadingComponent/>
                    )}
                </Col>
            </Row>
        );
    }
}