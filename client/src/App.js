import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';

import Navigation from './components/Navigation.js';
import ContentRaid from './components/ContentRaid.js';
import Profile from './components/Profile.js';
import Exchange from './components/Exchange.js';

function App() {
  return (
    <div className="container">
      <div className="App">
          <Navigation />

        <div className="Content">
          <Switch>
            <Route exact path='/exchange'>
              <Exchange />
            </Route>
            <Route exact path="/Raid/:id">
              <ContentRaid />
            </Route>
            <Route path="/">
              <Profile />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
