import React, { Component }                                     from 'react';
import { Breadcrumb, BreadcrumbItem }                           from 'reactstrap';
import { Card, CardHeader, Container, Row, Col, Button, Table } from 'reactstrap';
import { Link }                                                 from 'react-router-dom';

export default class Download extends Component {

    render () {
        return <Container>
            <h1 className="my-4">Download</h1>
            <Breadcrumb tag="div" listTag="ol">
                <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                <BreadcrumbItem active>Download</BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col xs="12" className="mb-4">
                    <Card className="h-100">
                        <CardHeader tag="h5">tRF explorer Release 2019-05</CardHeader>
                        <Table responsive>
                            <thead>
                            <tr>
                                <th>&nbsp;</th>
                                <th>Version</th>
                                <th>Size</th>
                                <th>Download</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>tRNA fragments list witd genomic positions</td>
                                <td>2019-05</td>
                                <td>21kB</td>
                                <td>
                                    <a className="btn btn-secondary btn-sm"
                                       href="/api/data/download/tRNA.fragments.hg19.tsv.gz">
                                        <i className="fas fa-download"/>Download</a>
                                </td>
                            </tr>
                            <tr>
                                <td>NCI60 RPM matrix</td>
                                <td>2019-05</td>
                                <td>65kB</td>
                                <td>
                                    <a className="btn btn-secondary btn-sm"
                                       href="/api/data/download/NCI60_RPM_matrix.tsv.gz">
                                        <i className="fas fa-download"/>Download</a>
                                </td>
                            </tr>
                            <tr>
                                <td>NCI60 TPM matrix</td>
                                <td>2019-05</td>
                                <td>77kB</td>
                                <td>
                                    <a className="btn btn-secondary btn-sm"
                                       href="/api/data/download/NCI60_TPM_matrix.tsv.gz">
                                        <i className="fas fa-download"/>Download</a>
                                </td>
                            </tr>
                            <tr>
                                <td>TCGA RPM matrix</td>
                                <td>2019-05</td>
                                <td>12MB</td>
                                <td>
                                    <a className="btn btn-secondary btn-sm"
                                       href="/api/data/download/TCGA_RPM_matrix.tsv.gz">
                                        <i className="fas fa-download"/>Download</a>
                                </td>
                            </tr>
                            <tr>
                                <td>TCGA TPM matrix</td>
                                <td>2019-05</td>
                                <td>12MB</td>
                                <td>
                                    <a className="btn btn-secondary btn-sm"
                                       href="/api/data/download/TCGA_TPM_matrix.tsv.gz">
                                        <i className="fas fa-download"/>Download</a>
                                </td>
                            </tr>
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </Container>;
    }
}
