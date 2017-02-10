import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export class TopBar extends React.Component {
  render() {
    return (
      <Navbar>
          <Navbar.Header>
              <Navbar.Brand>
                  <div>
                      <a href="#" className="topText">Joel Thiessen's Website</a>
                  </div>
              </Navbar.Brand>
              <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
              <Nav pullLeft>
                  <LinkContainer to={"/robots"}>
                      <NavItem eventKey={2}>FastSLAM Demo</NavItem>
                  </LinkContainer>
                  <LinkContainer to={"/resume"}>
                      <NavItem eventKey={2} href="#">Resume</NavItem>
                  </LinkContainer>
              </Nav>
              <Nav pullRight>
                  <LinkContainer to={"/about"}>
                      <NavItem eventKey={2} href="#">About</NavItem>
                  </LinkContainer>
              </Nav>
          </Navbar.Collapse>
      </Navbar>
      );
  }
}
