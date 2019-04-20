import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Header from "./Layout/Header";
import Home from "./Static/Home";
import Error404 from "./Static/Error404";
import Footer from "./Layout/Footer";


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
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route component={Error404}/>
                </Switch>
                <Footer/>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
