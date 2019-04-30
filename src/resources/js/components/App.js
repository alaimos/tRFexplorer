import React, { Component }             from "react";
import ReactDOM                         from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Header                           from "./Layout/Header";
import Home                             from "./Static/Home";
import Error404                         from "./Static/Error404";
import Footer                           from "./Layout/Footer";
import ContactUs                        from "./Static/ContactUs";
import Help                             from "./Static/Help";
import Browse                           from "./Static/Browse";
import BrowseByLocation                 from "./Static/BrowseByLocation";
import BrowseByExpression               from "./Static/BrowseByExpression";

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
                <main role="main" className="flex-shrink-0">
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route path="/fragments/:id" component={Home}/>
                        <Route path="/browse/byLocation" component={BrowseByLocation}/>
                        <Route path="/browse/byExpression" component={BrowseByExpression}/>
                        <Route path="/browse" component={Browse}/>
                        <Route path="/help" component={Help}/>
                        <Route path="/contactus" component={ContactUs}/>
                        <Route component={Error404}/>
                    </Switch>
                </main>
                <Footer/>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));
