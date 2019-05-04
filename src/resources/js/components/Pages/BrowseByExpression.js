import React, { Component }           from 'react';
import { Link }                       from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Container }                  from 'reactstrap';
import BrowseExpressionForm           from '../Components/Browse/BrowseExpressionForm';
import SearchByExpression             from '../Components/Browse/SearchByExpression';

export default class BrowseByExpression extends Component {
    constructor (props, context) {
        super(props, context);
        this.state = {
            formData: null,
            isSubmitted: false,
        };
    }

    handleSubmittedOnClick = () => {
        this.setState({
            formData: null,
            isSubmitted: false,
        });
    };

    handleFormSubmit = (values) => {
        this.setState({
            formData: values,
            isSubmitted: true,
        });
    };

    render () {
        const isSubmitted = this.state.isSubmitted;
        const formData = this.state.formData;
        return (
            <Container>
                <h1 className="my-4">Browse by expression{isSubmitted ? ' - Search Results' : ''}</h1>
                <Breadcrumb tag="div" listTag="ol">
                    <BreadcrumbItem><Link to="/">Home</Link></BreadcrumbItem>
                    <BreadcrumbItem><Link to="/browse">Browse</Link></BreadcrumbItem>
                    {isSubmitted ? (
                        <React.Fragment>
                            <BreadcrumbItem>
                                <Link to="/browse/byExpression" onClick={this.handleSubmittedOnClick}>
                                    By Expression
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>Search Results</BreadcrumbItem>
                        </React.Fragment>
                    ) : (
                        <BreadcrumbItem active>By Expression</BreadcrumbItem>
                    )}
                </Breadcrumb>
                {isSubmitted ? (
                    <SearchByExpression searchParameters={formData}/>
                ) : (
                    <BrowseExpressionForm submitHandler={this.handleFormSubmit}/>
                )}
            </Container>
        );
    }
}
