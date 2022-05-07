import { React } from 'react';
import { Container } from 'react-bootstrap';
import './App.css';
import { Route,  BrowserRouter } from 'react-router-dom';

import Navigation from './components/Navigation.js';
import ContentRaid from './components/ContentRaid.js';
import Profile from './components/Profile.js';
import Exchange from './components/Exchange.js';

function App() {
  return (
    <Container className="text-center">
      <BrowserRouter basename={process.env.REACT_APP_URL_BASE}>
        <Navigation />
        <Route exact path="/" component={Profile} />
        <Route path='/exchange' component={Exchange} />
        <Route path="/raid/0">
          <ContentRaid id={Number(0)} />
        </Route>
      </BrowserRouter>
    </Container>
  );
}

export default App;