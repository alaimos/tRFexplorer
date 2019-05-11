import PropTypes                                   from 'prop-types';
import React, { Component }                        from 'react';
import axios                                       from 'axios';
import { Row, Col, ModalBody, ModalHeader, Modal } from 'reactstrap';
import { ErrorComponent, LoadingComponent }        from '../Common/CommonComponent';

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
                    <Modal isOpen={this.state.modal} toggle={this.toggle}>
                        <ModalHeader toggle={this.toggle}>View correlation graph</ModalHeader>
                        <ModalBody>
                            {isLoaded ? (
                                isError ? (
                                    <ErrorComponent errorMessage={errorMessage}/>
                                ) : (
                                    <div className="embed-responsive embed-responsive-1by1">
                                        <img className="embed-responsive-item" alt="" src={data}/>
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
