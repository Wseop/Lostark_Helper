import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';

import Navigation from './Navigation.js';
import ContentRaid from './ContentRaid.js';
import Profile from './Profile.js';

function App() {
  return (
    <div className="container mt-3">
      <div className="App">
          <Navigation />

        <div className="Content">
          <Switch>
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
