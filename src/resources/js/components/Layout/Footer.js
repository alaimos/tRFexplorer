import React, {Component} from 'react';

export default class Footer extends Component {
    render() {
        return <footer className="py-5 bg-dark fixed-bottom">
            <div className="container">
                <p className="m-0 text-center text-white">Copyright &copy; S. Alaimo, Ph.D. 2019</p>
            </div>
        </footer>;
    }
}