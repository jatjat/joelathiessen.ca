import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Input, Button, Image, Jumbotron, Grid, Row, Col, Panel, LinkWithTooltip } from 'react-bootstrap';
import { Router, Route, Link, IndexRedirect, hashHistory } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import dinoImg from '../img/Dino.png';

var App = React.createClass({
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
})

var TopBar = React.createClass({
  render() {
    return (
      <Navbar>
          <Navbar.Header>
              <Navbar.Brand>
                  <div>
                      <Image src={dinoImg} cicle className="topIcon" />
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
                  <LinkContainer to={"/friends"}>
                      <NavItem eventKey={2} href="#">Friends</NavItem>
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
})

var MainGrid = React.createClass({
  render() {
    return (
      <Grid>
          <Row>
              <Col xs={9} md={9}>
              <Jumbo />
              </Col>
              <Col xs={9} md={9}>
              <Main />
              </Col>
          </Row>
      </Grid>
      );
  }
})

var Jumbo = React.createClass({
  render() {
    return (
      <Jumbotron>
          <h1>Welcome!</h1>
          <p>I, Joel Thiessen, am a software developer based in Winnipeg, Manitoba—and I enjoy creating things! You can check out one of my projects, a self-navigating-robot simulation, right here.
          </p>
          <p>
              <LinkContainer to={"/robots"}>
                  <Button bsStyle="primary">Show me!</Button>
              </LinkContainer>
          </p>
      </Jumbotron>
      );
  }
})

var Main = React.createClass({
  render() {
    return (
      <Panel>
          <p>
              <span>Employers, you can see my resume </span>
              <Link id="resumeLink" to="/employers">here</Link>
              <span>, or my FastSLAM demo </span>
              <Link id="fastSLAMLink" to="/robots">here.</Link>
          </p>
          <p>
              <span>Friends, when I have something to share, it’ll be </span>
              <Link id="friendsLink" to="/friends">here.</Link>
          </p>
          <p>
            <span>If you want to see the source-code for this </span>
            <a id="webGitHubLink" href="https://github.com/jatjat" >website</a>
            <span>, or my FastSLAM </span>
            <a id="fastSLAMGitHubLink" href="https://github.com/jatjat/kaly2" >demo</a>
            <span>, my GitHub is </span>
            <a id="parentGitHubLink" href="https://github.com/jatjat" >here.</a></p>
      </Panel>
    )
  }
})

var Employers = React.createClass({
  render() {
    return (<div>Employers!</div>);
  }
})
var Robots = React.createClass({
  render() {
    return (<div>Robots!</div>);
  }
})
var Friends = React.createClass({
  render() {
    return (<div>Friends!</div>);
  }
})
var About = React.createClass({
  render() {
    return (<div>About!</div>);
  }
})

var Root = React.createClass({
  render() {
    return (
      <Router history={hashHistory}>
          <Route path="/" component={App}>
              <IndexRedirect to="/main" />
              <Route path="/main" component={MainGrid} />
              <Route path="/employers" component={Employers} />
              <Route path="/robots" component={Robots} />
              <Route path="/friends" component={Friends} />
              <Route path="/about" component={About} />
          </Route>
      </Router>
      );
  }
})
ReactDOM.render(<Root />, document.getElementById('content'))
