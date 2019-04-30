import React, { Component }                                                  from "react";
import { Breadcrumb, BreadcrumbItem }                                        from "reactstrap";
import { Card, CardText, CardBody, CardHeader, Container, Row, Col, Button } from "reactstrap";
import { Link }                                                              from "react-router-dom";

export default class Browse extends Component {

    render() {
        return <Container>
            <h1 className="my-4">Browse</h1>
            <Breadcrumb tag="div" listTag="ol">
                <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                <BreadcrumbItem active>Browse</BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col xs="12" className="mb-4">
                    <Card className="h-100">
                        <CardHeader tag="h5">Browse by Location</CardHeader>
                        <CardBody>
                            <CardText>Select the following option if you wish to search for tRNA fragments using our Genomic Browser.</CardText>
                            <div className="text-center">
                                <Button tag={Link} to="/browse/byLocation">Open Browser</Button>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col xs="12" className="mb-4">
                    <Card className="h-100">
                        <CardHeader tag="h5">Browse by Expression</CardHeader>
                        <CardBody>
                            <CardText>Select the following option if you wish to search for tRNA fragments by their expression profile.</CardText>
                            <div className="text-center">
                                <Button tag={Link} to="/browse/byExpression">Open Browser</Button>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>;
    }
}
