import React, { Component }             from 'react';
import ReactDOM                         from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header                           from './Layout/Header';
import Home                             from './Pages/Home';
import Error404                         from './Pages/Error404';
import Footer                           from './Layout/Footer';
import ContactUs                        from './Pages/ContactUs';
import Help                             from './Pages/Help';
import { LoadingComponent }             from './Components/Common/CommonComponent';

const Browse = React.lazy(() => import('./Pages/Browse'));
const BrowseByLocation = React.lazy(() => import('./Pages/BrowseByLocation'));
const BrowseByExpression = React.lazy(() => import('./Pages/BrowseByExpression'));
const Fragment = React.lazy(() => import('./Pages/Fragment'));
const DEAnalysisIndex = React.lazy(() => import('./Pages/DEAnalysisIndex'));

const waitingComponent = Component => {
    return props => (
        <React.Suspense
            fallback={<div className="container"><LoadingComponent className="my-4" message="Please wait..."/></div>}>
            <Component {...props} />
        </React.Suspense>
    );
};

class App extends Component {
    constructor (props) {
        super(props);

    }

    render () {
        return (
            <BrowserRouter>
                <Header/>
                <main role="main" className="flex-shrink-0">
                    <Switch>
                        <Route exact path="/" component={Home}/>
                        <Route path="/de-analysis" component={waitingComponent(DEAnalysisIndex)} />
                        <Route path="/fragments/:id" component={waitingComponent(Fragment)}/>
                        <Route path="/fragments" component={waitingComponent(Browse)}/>
                        <Route path="/browse/byLocation" component={waitingComponent(BrowseByLocation)}/>
                        <Route path="/browse/byExpression" component={waitingComponent(BrowseByExpression)}/>
                        <Route path="/browse" component={waitingComponent(Browse)}/>
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
