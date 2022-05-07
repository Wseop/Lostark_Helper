import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';

import Navigation from './components/Navigation.js';
import ContentRaid from './components/ContentRaid.js';
import Profile from './components/Profile.js';
import Exchange from './components/Exchange.js';
import { BrowserRouter } from 'react-router-dom/cjs/react-router-dom.min';

function App() {
  return (
    <div className="container">
      <div className="App">
          <Navigation />

        <BrowserRouter basename={process.env.URL_BASE}>
          <Switch>
            <Route exact path="/" component={Profile} />
            <Route path='/exchange' component={Exchange} />
            <Route path="/raid" component={ContentRaid} />
          </Switch>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;