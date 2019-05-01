import React, { Component }             from 'react';
import ReactDOM                         from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header                           from './Layout/Header';
import Home                             from './Pages/Home';
import Error404                         from './Pages/Error404';
import Footer                           from './Layout/Footer';
import ContactUs                        from './Pages/ContactUs';
import Help                             from './Pages/Help';
import Browse                           from './Pages/Browse';
import BrowseByLocation                 from './Pages/BrowseByLocation';
import BrowseByExpression               from './Pages/BrowseByExpression';
import Fragment                         from './Pages/Fragment';

class App extends Component {
    constructor (props) {
        super(props);

    }

    onClickHandle = () => {
        alert('This is an example button');
    };

    render () {
        return (
            <BrowserRouter>
                <Header/>
                <main role="main" className="flex-shrink-0">
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route path="/fragments/:id" component={Fragment}/>
                        <Route path="/fragments" component={Browse}/>
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

ReactDOM.render(<App/>, document.getElementById('app'));
