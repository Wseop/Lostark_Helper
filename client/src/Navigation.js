import React, { useState, useEffect } from 'react';
import './Navigation.css';
import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation(props) {
    return (
        <Navbar bg="dark" variant="dark">
          <Container id="NaviContainer">
          <Navbar.Brand as={Link} to="/">LoaHelper</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href='/exchange'>거래소</Nav.Link>
            <NavDropdown title="레이드">
                <NavDropdown.Item as={Link} to ="/Raid/0">아브렐슈드</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          </Container>
        </Navbar>
    );
}

export default Navigation;