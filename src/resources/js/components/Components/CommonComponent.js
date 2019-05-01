import PropTypes          from 'prop-types';
import React              from 'react';
import { Alert, Spinner } from 'reactstrap';

export const LoadingComponent = (props) => {
    const message = (props.message) ? (
        <React.Fragment>
            <br/>
            <h3>{props.message}</h3>
        </React.Fragment>
    ) : null;
    return <div className="text-center">
        <Spinner style={{ width: '3rem', height: '3rem' }}/>
        {message}
    </div>;
};

LoadingComponent.propTypes = {
    message: PropTypes.string,
};

export const ErrorComponent = (props) => (
    <Alert color="danger">
        <h4 className="alert-heading">Error!</h4>
        <p>{props.errorMessage}</p>
    </Alert>
);

ErrorComponent.propTypes = {
    errorMessage: PropTypes.string.isRequired,
};
