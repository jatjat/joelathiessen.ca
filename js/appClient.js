import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Input, Button, Image, Jumbotron, Grid, Row, Col, Panel, LinkWithTooltip, Well } from 'react-bootstrap';
import { Router, Route, Link, IndexRedirect, hashHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { ReactPDF } from './pdfViewer';
import { RobotsApp } from './robotsAppClient';

const rotl33tStr = (string) => {
  return string.replace(/[A-Za-z]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) + (char.toUpperCase() <= "M" ? 13 : -13));
  });
}

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
                  <LinkContainer to={"/employers"}>
                      <NavItem eventKey={2} href="#">Employers</NavItem>
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
              <span>Employers, you can see <Link id="aboutLink" to="/about">my</Link> resume </span>
              <Link id="resumeLink" to="/employers">here</Link>
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

class Employers extends React.Component {
  render() {
    return (
      <Grid>
          <Row>
              <Col xs={12} md={9}>
              <Panel>
                  <Col xs={12} md={9}> Hey employers! Here's a little background about me:
                  <br />
                  <br /> I'm a Computer Science Co-op student currently completing my last semester at the University of Manitoba. I'll be graduating in January 2017.
                  <br />
                  <br /> In the course of my three work terms, highlights for me included creating a tool to facilitate the secure transfer of genomic data, implementing functionality improving the production of 3D and video visual effects, and instrumenting a multi-platform video-collaberation application for automation.
                  <br />
                  <br /> I've had a chance to work with many different technologies, from web-centric tech like Spring and Angular, to high performance modern C++, to cross platform C# for iOS and Android; and have worked in Linux and OS X extensively, often with Python.
                  <br />
                  <br /> This website was my introduction to ES6, React, and Node.js, and my FastSLAM implementation is written in Kotlin—I like learning new things!
                  <br />
                  <br /> A viewable copy of my resume is included below <a id="resumeDownloadLink" href={this.props.resSrc} download="JoelThiessenResume.pdf">(direct link)</a>.
                  <br />
                  </Col>
              </Panel>
              <span></span>
              <Well>
                  <ReactPDF src={this.props.resSrc} />
              </Well>
              </Col>
              <Col xs={12} md={9}>
              </Col>
          </Row>
      </Grid>
      );
  }
}
Employers.defaultProps = {
  resSrc: rotl33tStr("/choyvp/erf.cqs")
}

class Robots extends React.Component {
  render() {
    return (<RobotsApp namespace="/" />);
  }
}

class About extends React.Component {
  render() {
    return (
      <Grid>
          <Row>
              <Col xs={12} md={9}>
              <Panel>
                  <Col xs={4} md={4}>
                  <Image src="/img/JoelThiessenPhotoSmall.jpeg" rounded responsive />
                  </Col>
                  <span></span>
                  <Col xs={4} md={8}>
                  <Panel>
                      About this website: it's mostly for projects I think are cool, and for necessary marketing.
                      <br /> About me: I enjoy reading and thinking.
                  </Panel>
                  </Col>
              </Panel>
              </Col>
          </Row>
      </Grid>
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
              <Route path="/employers" component={Employers} />
              <Route path="/robots" component={Robots} />
              <Route path="/about" component={About} />
          </Route>
      </Router>
      );
  }
}

ReactDOM.render(<Root />, document.getElementById('content'))
