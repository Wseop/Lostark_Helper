import React from 'react';
import { Navbar, NavDropdown, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
    return (
      <Navbar className="sticky-top ps-3 pe-3" bg="dark" variant="dark">
        <Navbar.Brand as={Link} to="/">LoaHelper</Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to="/">캐릭터 정보</Nav.Link>
          <Nav.Link as={Link} to="/exchange">거래소</Nav.Link>
          <NavDropdown title="레이드">
            <NavDropdown.Item as={Link} to="/raid/0">아브렐슈드</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>
    );
}

export default Navigation;