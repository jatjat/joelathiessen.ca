import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Input, Button, Image, Jumbotron, Panel, LinkWithTooltip, Well } from 'react-bootstrap';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { ReactPDF } from './pdfViewer';
import { rotl33tStr } from './util'
import { About } from './about'
import { Resume } from './resume'
import { Robots } from './robots'
import { MainGrid } from './mainGrid'

class App extends React.Component {
  render() {
    return (
      <div>
          <div>
              <TopBar />
          </div>
          {this.props.children}
      </div>
      );
  }
}

class TopBar extends React.Component {
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

class Root extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
          <Route path="/" component={App}>
              <IndexRedirect to="/main" />
              <Route path="/main" component={MainGrid} />
              <Route path="/resume" component={Resume} />
              <Route path="/robots" component={Robots} />
              <Route path="/about" component={About} />
          </Route>
      </Router>
      );
  }
}

ReactDOM.render(<Root />, document.getElementById('content'))
