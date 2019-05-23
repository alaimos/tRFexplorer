import PropTypes                                   from 'prop-types';
import React, { Component }                        from 'react';
import axios                                       from 'axios';
import { Row, Col, ModalBody, ModalHeader, Modal } from 'reactstrap';
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

export default class GraphModalComponent extends Component {

    static propTypes = {
        col: PropTypes.string.isRequired,
        correlation: PropTypes.string.isRequired,
        dataset: PropTypes.string.isRequired,
        row: PropTypes.string.isRequired,
        getShowModal: PropTypes.func,
    };

    state = {
        error: null,
        isLoaded: false,
        data: null,
        modal: true,
    };

    setError (message) {
        this.setState({
            isLoaded: true,
            error: message,
        });
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (prevProps.row !== this.props.row || prevProps.col !== this.props.col ||
            prevProps.correlation !== this.props.correlation || prevProps.dataset !== this.props.dataset) {
            this.getData().catch((e) => (this.setError(e.message)));
        }
    }

    toggle = () => this.setState(prevState => ({
        modal: !prevState.modal,
    }));

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

    async getData () {
        try {
            const response = await axios.post(
                `/api/correlation/${this.props.correlation}/dataset/${this.props.dataset}/graph`,
                {
                    row: this.props.row,
                    col: this.props.col,
                });
            const data = this.responseHandler(response);
            if (data) {
                this.setState({
                    isLoaded: true,
                    data,
                });
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount () {
        this.getData().catch((e) => (this.setError(e.message)));
        if (this.props.getShowModal) {
            this.props.getShowModal((modal = true) => {
                this.setState({
                    modal,
                });
            });
        }
    }

    render () {
        const isLoaded = this.state.isLoaded;
        const errorMessage = this.state.error;
        const isError = errorMessage !== null;
        const data = this.state.data;
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Modal isOpen={this.state.modal} toggle={this.toggle} size="lg">
                        <ModalHeader toggle={this.toggle}>View correlation graph</ModalHeader>
                        <ModalBody>
                            {isLoaded ? (
                                isError ? (
                                    <ErrorComponent errorMessage={errorMessage}/>
                                ) : (
                                    <div className="embed-responsive embed-responsive-1by1">
                                        <StyledIframe src={data} frameBorder={0}/>
                                    </div>
                                )
                            ) : (
                                <LoadingComponent/>
                            )}
                        </ModalBody>
                    </Modal>
                </Col>
            </Row>
        );
    }
}
