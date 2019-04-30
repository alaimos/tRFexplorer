import React, { Component }                              from "react";
import { Card, CardText, CardBody, Container, Row, Col } from "reactstrap";

export default class Home extends Component {

    render() {
        return (
            <Container>
                <h1 className="my-4">Welcome to the tRF Explorer</h1>
                <Row>
                    <Col xs="12" className="mb-4">
                        <Card className="h-100">
                            <CardBody>
                                <CardText>tRFexplorer is a public database through which users may display the expression profile of tRNA-derived
                                    ncRNAs in every cell line of NCI-60. The system allows to perform correlation analyses of tRNA-derived ncRNAs
                                    expression with all omics data and compound activities available on CellMiner. This provides an important
                                    opportunity to investigate their potential biological roles in absence of direct experimental
                                    evidences.</CardText>
                                <CardText>The database reports 143 distinct tRNA-derived ncRNAs, categorized in tRNA-derived fragments (9 tRF-5s, 45
                                    tRF-3s), tRNA-derived small RNAs (75 tsRNAs), and tRNA 5’ leader RNAs (14 sequences identified). This latter group
                                    represents an additional evidence of tRNA-derived ncRNAs originating from the 5’ leader region of precursor tRNA,
                                    a class of tRNA-derived small RNAs currently poorly investigated.</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}
