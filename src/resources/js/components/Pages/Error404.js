import React, { Component }                              from 'react';
import { Card, CardText, CardBody, Container, Row, Col } from 'reactstrap';

export default class Error404 extends Component {

    render () {
        return <Container>
            <h1 className="my-4">404 - Not Found</h1>
            <Row>
                <Col xs="12" className="mb-4">
                    <Card className="h-100">
                        <CardBody>
                            <CardText>The page you are looking for was not found!</CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>;
    }
}
