import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { Link, Route, Switch } from 'react-router-dom';

import Navigation from './Navigation.js';
import ContentRaid from './ContentRaid.js';

function App() {
  return (
    <div className="App">
        <Navigation />

      <div className="Content">
        <Switch>
          <Route exact path="/Raid/:id">
            <ContentRaid />
          </Route>
          <Route path="/">
            main
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;
