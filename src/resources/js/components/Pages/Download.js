import React, { Component }                                                  from 'react';
import { Breadcrumb, BreadcrumbItem }                                        from 'reactstrap';
import { Card, CardText, CardBody, CardHeader, Container, Row, Col, Button } from 'reactstrap';
import { Link }                                                              from 'react-router-dom';

export default class Download extends Component {

    render () {
        return <Container>
            <h1 className="my-4">Download</h1>
            <Breadcrumb tag="div" listTag="ol">
                <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                <BreadcrumbItem active>Download</BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col xs="12" className="mb-4">
                    <Card className="h-100">
                        <CardHeader tag="h5">tRF explorer Release 2019-05</CardHeader>
                        <CardBody>
                            <CardText>Select the following option if you wish to
                                search for tRNA fragments using our Genomic
                                Browser.</CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>;
    }
}
