import React, { Component }    from "react";
import { Container, Row, Col } from "reactstrap";

export default class ContactUs extends Component {

    render() {
        return <Container>
            <h1 className="mt-4 mb-3">Contact</h1>
            <Row>
                <Col lg={12} className="mb-4">
                    <h3>Bug Reports</h3>
                    <p>
                        For bugs reporting, please contact S. Alaimo at
                        <a href="mailto:alaimos@dmi.unict.it">alaimos@dmi.unict.it</a>
                    </p>
                </Col>
            </Row>
            <Row>
                <Col lg={12} className="mb-4">
                    <h3>References</h3>
                    <p>
                        If you are using this software please cite:
                    </p>
                    <blockquote className="blockquote alert alert-dark">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.
                    </blockquote>
                </Col>
            </Row>
            <Row>
                <Col lg={12} className="mb-4">
                    <h3>Authors</h3>
                    <address>
                        <span className="text-info">
                            <strong>Alessandro La Ferlita</strong>
                        </span><br/>Dept. of Physics and Astronomy and
                        Dept. of Clinical and Experimental Medicine<br/>University of Catania
                    </address>
                    <address>
                        <span className="text-info">
                            <strong>Salvatore Alaimo</strong>
                        </span>
                        <br/>
                        Dept. of Clinical and Experimental Medicine
                        <br/>
                        University of Catania
                    </address>
                    <address>
                        <span className="text-info">
                            <strong>Carlo Maria Croce</strong>
                        </span>
                        <br/>
                        Dept. of Molecular Virology, Immunology and Medical Genetics
                        <br/>
                        The Ohio State University
                    </address>
                    <address>
                        <span className="text-info">
                            <strong>Alfredo Ferro</strong>
                        </span>
                        <br/>
                        Dept. of Clinical and Experimental Medicine
                        <br/>
                        University of Catania
                    </address>
                    <address>
                        <span className="text-info">
                            <strong>Alfredo Pulvirenti</strong>
                        </span>
                        <br/>
                        Dept. of Clinical and Experimental Medicine
                        <br/>
                        University of Catania
                    </address>
                </Col>
            </Row>
        </Container>;
    }
}
