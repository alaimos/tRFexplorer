import PropTypes                                                             from 'prop-types';
import React, { Component }                                                  from 'react';
import { Breadcrumb, BreadcrumbItem }                                        from 'reactstrap';
import { Card, CardText, CardBody, CardHeader, Container, Row, Col, Button } from 'reactstrap';
import { Link }                                                              from 'react-router-dom';
import TRFComponent                                                          from '../Components/TRFComponent';

export default class Fragment extends Component {

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    };

    constructor (props) {
        super(props);
    }

    render () {
        return <Container>
            <h1 className="my-4">{this.props.match.params.id}</h1>
            <Breadcrumb tag="div" listTag="ol">
                <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                <BreadcrumbItem><Link to="/fragments">Fragments</Link></BreadcrumbItem>
                <BreadcrumbItem active>{this.props.match.params.id}</BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col xs="12" className="mb-4">
                    <TRFComponent fragmentId={this.props.match.params.id}/>
                </Col>
            </Row>
        </Container>;
    }
}
