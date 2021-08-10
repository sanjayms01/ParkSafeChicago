import React from "react";
import { Route } from "react-router-dom";
import UserAddress from './pages/userAddress';
import Overview from './pages/overview';
import Title from './components/title';
import AboutUs from "./pages/about";

class App extends React.Component {

    /**
     * Initialize
     */
    constructor(props) {
        super(props);
    }

    /**
     * Render components
     */
    render() {
        let props = this.props;
        
        return (
            <div>
                <Title/>
                <Route exact path="/" render={props => <Overview {...props} />} />
                <Route exact path="/overview" render={props => <Overview {...props} />} />
                <Route exact path="/address" render={props => <UserAddress {...props} />} />
                <Route exact path="/about" render={props => <AboutUs {...props} />} />
            </div>
        );
    }
}

/**
 * Default export
 */
export default App;