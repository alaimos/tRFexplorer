import PropTypes                                   from 'prop-types';
import React                                       from 'react';
import axios                                       from 'axios';
import { Card, CardBody, Row, Col, Alert, Button } from 'reactstrap';
import { ErrorComponent, LoadingComponent }        from '../Common/CommonComponent';
import styled                                      from 'styled-components';

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
  background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100% 100%"><text fill="%23FF0000" x="50%" y="50%" font-family="\\'Lucida Grande\\', sans-serif" font-size="24" text-anchor="middle">Loading...</text></svg>') 0px 0px no-repeat;
`;

export default class DEResultsView extends React.Component {

    static propTypes = {
        analysisId: PropTypes.string,
    };

    constructor (props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: [],
            selectedContrast: '',
        };
    }

    setError (message) {
        this.setState({
            isLoaded: true,
            error: message,
        });
    }

    static contrastToString (contrast) {
        return `${contrast.case.join(' and ')} vs ${contrast.control.join(' and ')}`;
    }

    contrastsToSelectOptions () {
        const tmp = this.state.data.contrasts.map((c, i) => (
            <option value={i} key={i}>{DEResultsView.contrastToString(c)}</option>
        ));
        tmp.unshift(<option value="" key="__EMPTY__"/>);
        return tmp;
    }

    responseHandler (response) {
        if (response.status !== 200) {
            this.setError(response.statusText);
        } else {
            const data = response.data;
            if (data.error) {
                this.setError(data.message);
            } else {
                return data.data;
            }
        }
        return null;
    }

    async getSearchResult () {
        try {
            const url = '/api/de/' + this.props.analysisId;
            const response = await axios.get(url);
            const data = this.responseHandler(response);
            if (data) {
                this.setState({
                    isLoaded: true,
                    data,
                });
                console.log(data);
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount () {
        this.getSearchResult().catch((e) => (this.setError(e.message)));
    }

    handleContrastSelect = (evt) => {
        const { value: selectedContrast } = evt.target;
        this.setState({ selectedContrast });
    };

    render () {
        const analysisId = this.props.analysisId;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.error !== null;
        const selectedContrast = this.state.selectedContrast;
        const iframeUrl = (selectedContrast !== '') ? this.state.data.deUrls[parseInt(selectedContrast)] : null;
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Card>
                        <CardBody>
                            {isLoaded ? (
                                isError ? (
                                    <ErrorComponent errorMessage={this.state.error}/>
                                ) : (
                                    <React.Fragment>
                                        <Row>
                                            <Col sm={12} md={{ size: 4, offset: 4 }} className="text-center">
                                                <strong>Please select a contrast to view results:</strong><br/>
                                                <select value={selectedContrast} name="contrasts-selector"
                                                        className="form-control" onChange={this.handleContrastSelect}>
                                                    {this.contrastsToSelectOptions()}
                                                </select>
                                            </Col>
                                        </Row>
                                        {selectedContrast !== '' ? (
                                            <React.Fragment>
                                                <Row>
                                                    <Col sm={12} className="mt-2">
                                                        <ContainerDiv>
                                                            <StyledIframe src={iframeUrl} frameBorder={0}/>
                                                        </ContainerDiv>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm={12} className="mt-2 text-center">
                                                        <Button color="outline-info"
                                                                href={`/api/de/${analysisId}/download/summary`}>
                                                            <i className="fas fa-download fa-fw"/>
                                                            &nbsp;Download summary
                                                        </Button>
                                                        &nbsp;
                                                        <Button color="outline-info"
                                                                href={`/api/de/${analysisId}/download/${selectedContrast}`}>
                                                            <i className="fas fa-download fa-fw"/>
                                                            &nbsp;Download contrast result
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </React.Fragment>
                                        ) : (
                                            <React.Fragment>
                                                <Row>
                                                    <Col sm={12} className="mt-2">
                                                        <Alert color="warning">Please select a contrast</Alert>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm={12} className="mt-2 text-center">
                                                        <Button color="outline-info"
                                                                href={`/api/de/${analysisId}/download/summary`}>
                                                            <i className="fas fa-download fa-fw"/>
                                                            &nbsp;Download summary
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </React.Fragment>
                                        )}

                                    </React.Fragment>
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
