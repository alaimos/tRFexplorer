import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Card, CardText, CardBody, CardFooter, CardHeader, Container, Row, Col, Button} from 'reactstrap';


class App extends Component {
    constructor(props) {
        super(props);

    }

    onClickHandle = () => {
        alert("This is an example button");
    };


    render() {
        return (
            <BrowserRouter>
                <Container>
                    <Row className="justify-content-center">
                        <Col md="8">
                            <Card>
                                <CardHeader>Example Component</CardHeader>
                                <CardBody>
                                    <CardText>I'm an example component!</CardText>
                                </CardBody>
                                <CardFooter>
                                    <Button color="danger" onClick={this.onClickHandle}>
                                        <i className="fas fa-coffee"/>
                                        &nbsp;Test!!
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
