import React, { Component }           from 'react';
import { Link }                       from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Container, Row, Col }        from 'reactstrap';
import styled                         from 'styled-components';

const ContainerDiv = styled.div`
  position: relative;
  height: 0;
  overflow: hidden;
  max-width: 100%;
  padding-bottom: 55%;
`;

const StyledIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export default class BrowseByLocation extends Component {

    render () {
        return <Container>
            <h1 className="my-4">Browse by location</h1>
            <Breadcrumb tag="div" listTag="ol">
                <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                <BreadcrumbItem><Link
                    to="/browse">Browse</Link></BreadcrumbItem>
                <BreadcrumbItem active>By Location</BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col xs="12" className="mb-4">
                    <ContainerDiv>
                        <StyledIframe
                            src="/ext/jbrowse/index.html?tracklist=0&nav=1&overview=1"
                            frameBorder={0} allowFullScreen/>
                    </ContainerDiv>
                </Col>
            </Row>
        </Container>;
    }
}
