import PropTypes                                                     from 'prop-types';
import React                                                         from 'react';
import axios                                                         from 'axios/index';
import { Card, CardBody, Row, Col, ListGroup, ListGroupItem, Alert } from 'reactstrap';
import { Link }                                                      from 'react-router-dom';
import { BackToTop, ErrorComponent, LoadingComponent }               from '../Common/CommonComponent';
import ScrollableAnchor, { configureAnchors, goToTop }               from 'react-scrollable-anchor';
import TranscriptFragment                                            from './TranscriptFragment';

const waitingComponent = Component => {
    return props => (
        <React.Suspense
            fallback={<LoadingComponent className="my-4" message="Please wait..."/>}>
            <Component {...props} />
        </React.Suspense>
    );
};

const Plot = waitingComponent(React.lazy(() => import('../../../../../node_modules/react-plotly.js/react-plotly')));
const MultiBoxplot = waitingComponent(React.lazy(() => import('../Common/MultiBoxplot')));


configureAnchors({ offset: -60 });

const makeBarTraces = (data, clinical) => {
    const all_samples = clinical['samples'];
    const all_tissues = clinical['tissue'];
    const ys = {};
    const xs = {};
    const tissues = [];
    for (let i = 0; i < data.length; i++) {
        if (all_samples[i] !== null && all_tissues[i] !== null && data[i] !== null) {
            if (ys[all_tissues[i]] === undefined) {
                ys[all_tissues[i]] = [];
                xs[all_tissues[i]] = [];
                tissues.push(all_tissues[i]);
            }
            ys[all_tissues[i]].push(data[i]);
            xs[all_tissues[i]].push(all_samples[i]);
        }
    }
    tissues.sort();
    return tissues.map(k => {
        const x = xs[k];
        const y = ys[k];
        return {
            x,
            y,
            name: k,
            visible: true,
            type: 'bar',
        };
    });
};

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
        const len = this.state.data.NCI60.RPM.length;
        const data = makeBarTraces(this.state.data.NCI60.RPM, this.state.clinical.NCI60);
        const layout = {
            autosize: true,
        };
        return (
            <React.Fragment>
                <Row>
                    <Col xs={12}>
                        <ScrollableAnchor id="nci-60">
                            <h3>Expression in NCI-60</h3>
                        </ScrollableAnchor>
                        {len > 0 ? (
                            <Row>
                                <Col xs={12} className="text-center">
                                    <Plot data={data} layout={layout} useResizeHandler style={{
                                        width: '100%',
                                        height: '100%',
                                    }}/>
                                </Col>
                            </Row>
                        ) : (
                            <Alert color="warning">
                                <p>This tRF is not expressed in any cell line.</p>
                            </Alert>
                        )}
                    </Col>
                </Row>
                <BackToTop/>
            </React.Fragment>
        );
    }

    tcgaGraph () {
        const len = this.state.data.TCGA.RPM.length;
        return (
            <React.Fragment>
                <Row>
                    <Col xs={12}>
                        <ScrollableAnchor id="tcga">
                            <h3>Expression in TCGA</h3>
                        </ScrollableAnchor>
                        {len > 0 ? (
                            <MultiBoxplot data={this.state.data.TCGA.RPM} clinical={this.state.clinical.TCGA}/>
                        ) : (
                            <Alert color="warning">
                                <p>This tRF is not expressed in any TCGA sample.</p>
                            </Alert>
                        )}
                    </Col>
                </Row>
                <BackToTop/>
            </React.Fragment>
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
