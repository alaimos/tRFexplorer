import React, { Component } from 'react';

export default class Footer extends Component {
    render () {
        return <footer className="footer mt-auto py-3 bg-dark">
            <div className="container">
                <p className="m-0 text-center text-muted">Copyright &copy; 2019
                    - S. Alaimo, Ph.D.</p>
            </div>
        </footer>;
    }
}
