import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Input, Button, Image, Jumbotron, Grid, Row, Col, Panel, LinkWithTooltip, Well } from 'react-bootstrap';
import { Router, Route, Link, IndexRedirect, hashHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { ReactPDF } from './pdfViewer';
import { rotl33tStr } from './util'
import { About } from './about'
import { Resume } from './resume'
import { Robots } from './robots'

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

class MainGrid extends React.Component {
  render() {
    return (
      <Grid>
          <Row>
              <Col xs={12} md={9}>
              <Jumbo />
              </Col>
              <Col xs={12} md={9}>
              <Main />
              </Col>
          </Row>
      </Grid>
      );
  }
}

class Jumbo extends React.Component {
  render() {
    return (
      <Jumbotron>
          <h1>Welcome!</h1>
          <p>I, Joel Thiessen, am a software developer based near Winnipeg, Manitoba—and I enjoy creating things! You can check out one of my projects, a self-locating-robot simulation, right here.
          </p>
          <p>
              <LinkContainer to={"/robots"}>
                  <Button bsStyle="primary">Show me!</Button>
              </LinkContainer>
          </p>
      </Jumbotron>
      );
  }
}

class Main extends React.Component {
  render() {
    return (
      <Panel>
          <p>
              <span>You can see <Link id="aboutLink" to="/about">my</Link> resume </span>
              <Link id="resumeLink" to="/resume">here</Link>
          </p>
          <p>
              <span>If you want to see the source-code for this </span>
              <a id="webGitHubLink" href="https://github.com/jatjat/joelathiessen.ca">website</a>
              <span>, or my </span>
              <a id="fastSLAMGitHubLink" href="https://github.com/jatjat/kaly2">FastSLAM demo</a>
              <span>, my GitHub is </span>
              <a id="parentGitHubLink" href="https://github.com/jatjat">here.</a></p>
      </Panel>
    )
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
