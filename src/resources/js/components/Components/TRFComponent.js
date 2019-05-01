import PropTypes                            from 'prop-types';
import React                                from 'react';
import axios                                from 'axios';
import { Card, CardBody, Row, Col }         from 'reactstrap';
import { Link }                             from 'react-router-dom';
import { ErrorComponent, LoadingComponent } from './CommonComponent';

export default class TRFComponent extends React.Component {

    static propTypes = {
        fragmentId: PropTypes.string,
    };

    constructor (props, context) {
        super(props, context);
        this.state = {
            error: null,
            isLoaded: false,
            data: [],
            clinical: {},
        };
    }

    setError (message) {
        this.setState({
            isLoaded: true,
            error: message,
        });
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
            const url = '/api/fragments/' + this.props.fragmentId;
            const response = await axios.get(url);
            const data = this.responseHandler(response);
            if (data) {
                const response1 = await axios.get('/api/data/clinical');
                const clinical = this.responseHandler(response1);
                if (clinical) {
                    this.setState({
                        isLoaded: true,
                        data,
                        clinical,
                    });
                }
            }
        } catch (e) {
            this.setError(e.message);
        }
    }

    componentDidMount () {
        this.getSearchResult().catch((e) => (this.setError(e.message)));
    }

    render () {
        console.log(this.state);
        const data = this.state.data;
        const isLoaded = this.state.isLoaded;
        const isError = this.state.error !== null;
        return (
            <Row>
                <Col xs="12" className="mb-4">
                    <Card>
                        <CardBody>
                            {isLoaded ? (
                                isError ? (
                                    <ErrorComponent errorMessage={this.state.error}/>
                                ) : (
                                    null
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
