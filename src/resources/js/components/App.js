import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Header from "./Layout/Header";
import Home from "./Static/Home";


class App extends Component {
    constructor(props) {
        super(props);

    }

    onClickHandle = () => {
        alert("This is an example button");
    };


    render() {
        return (
            <BrowserRouter>
                <Header/>
                <Route exact path="/" component={Home} />
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
