import React from "react";
import { Link } from "react-router-dom";
import { Button, Jumbotron } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

export class Jumbo extends React.Component {
  render() {
    return (
      <Jumbotron>
        <h1>Welcome!</h1>
        <p>
          I, Joel Thiessen, am a software developer based near Winnipeg,
          Manitoba. You can check out one of my projects, a self-locating-robot
          simulation, right <Link to={"/robots"}>here</Link>.
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
