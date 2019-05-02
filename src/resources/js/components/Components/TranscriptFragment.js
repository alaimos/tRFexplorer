import PropTypes                     from 'prop-types';
import React                         from 'react';
import { Row, Col }                  from 'reactstrap';
import ScrollableAnchor, { goToTop } from 'react-scrollable-anchor';

const getBrowserLink = (transcript) => (
    '/ext/jbrowse/index.html?tracklist=0&nav=0&overview=0&loc=' + transcript.chr + '%3A' + transcript.start + '..' +
    transcript.end + ''
);

export default function TranscriptFragment (props) {
    const transcript = props.transcript;
    return (
        <React.Fragment>
            <Row>
                <Col xs={12}>
                    <ScrollableAnchor id={transcript.id}>
                        <h4>{transcript.name}</h4>
                    </ScrollableAnchor>
                    <Row tag="dl">
                        <Col sm={2} tag="dt">Chromosome:</Col>
                        <Col sm={10} tag="dd">{transcript.chr}</Col>
                        <Col sm={2} tag="dt">Position:</Col>
                        <Col sm={10} tag="dd">{transcript.start.toLocaleString() + ' - ' +
                                               transcript.end.toLocaleString()}</Col>
                        <Col sm={2} tag="dt">Strand:</Col>
                        <Col sm={10} tag="dd">
                            {(transcript.strand === '+') ? (
                                <i className="fas fa-arrow-right"/>
                            ) : (
                                <i className="fas fa-arrow-left"/>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className="text-center">
                    <div className="embed-responsive embed-responsive-21by9">
                        <iframe className="embed-responsive-item" src={getBrowserLink(transcript)}
                                allowFullScreen/>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className="text-right mt-4">
                    <a href="#" onClick={() => goToTop()}>Go to top</a>
                </Col>
            </Row>
        </React.Fragment>
    );
}

TranscriptFragment.propTypes = {
    transcript: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        chr: PropTypes.string.isRequired,
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        strand: PropTypes.oneOf(['+', '-']),
    }).isRequired,
};
