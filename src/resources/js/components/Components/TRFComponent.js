import PropTypes                                              from 'prop-types';
import React                                                  from 'react';
import axios                                                  from 'axios';
import { Card, CardBody, Row, Col, ListGroup, ListGroupItem } from 'reactstrap';
import { Link }                                               from 'react-router-dom';
import { ErrorComponent, LoadingComponent }                   from './CommonComponent';
import ScrollableAnchor, { configureAnchors, goToTop }        from 'react-scrollable-anchor';
import TranscriptFragment                                     from './TranscriptFragment';
import Plot                                                   from 'react-plotly.js';
import MultiBoxplot                                           from './MultiBoxplot';

configureAnchors({ offset: -60 });

const makeBarTrace = (data, name, visible) => ({
    x: Object.keys(data),
    y: Object.values(data),
    name,
    visible,
    type: 'bar',
});

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

    headerFragment () {
        const transcripts = Object.keys(this.state.data.transcripts);
        return (
            <Row tag="dl">
                <Col sm={2} tag="dt">Name:</Col>
                <Col sm={10} tag="dd">{this.state.data.name}</Col>
                <Col sm={2} tag="dt">Aminoacid:</Col>
                <Col sm={10} tag="dd">{Object.values(this.state.data.aminoacids).join(', ')}</Col>
                <Col sm={2} tag="dt">Anticodon:</Col>
                <Col sm={10} tag="dd">{Object.values(this.state.data.anticodons).join(', ')}</Col>
                <Col sm={2} tag="dt">Transcripts:</Col>
                <Col sm={10} tag="dd">
                    <ListGroup flush tag="div">
                        {transcripts.map((id) => (
                            <ListGroupItem key={id} tag="a" className="list-group-item-action"
                                           href={'#' + id}>
                                {id}
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        );
    }

    nci60Graph () {
        const data = [
            makeBarTrace(this.state.data.NCI60.RPM, 'RPM', true),
        ];
        const layout = {
            autosize: true,
        };
        return (
            <Row>
                <Col xs={12}>
                    <ScrollableAnchor id="nci-60">
                        <h3>Expression in NCI-60</h3>
                    </ScrollableAnchor>
                    <Row>
                        <Col xs={12} className="text-center">
                            <Plot data={data} layout={layout} useResizeHandler style={{
                                width: '100%',
                                height: '100%',
                            }}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }

    tcgaGraph () {
        return (
            <Row>
                <Col xs={12}>
                    <ScrollableAnchor id="tcga">
                        <h3>Expression in TCGA</h3>
                    </ScrollableAnchor>
                    <MultiBoxplot data={this.state.data.TCGA.RPM} clinical={this.state.clinical} />
                </Col>
            </Row>
        );
    }

    transcriptsFragment () {
        const transcripts = Object.values(this.state.data.transcripts);
        return (
            <React.Fragment>
                <ScrollableAnchor id="transcripts">
                    <h3>Transcripts</h3>
                </ScrollableAnchor>
                {transcripts.map((f) => <TranscriptFragment key={f.id} transcript={f}/>)}
            </React.Fragment>
        );
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
                                    <React.Fragment>
                                        {this.headerFragment()}
                                        {this.nci60Graph()}
                                        {this.tcgaGraph()}
                                        {this.transcriptsFragment()}
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
