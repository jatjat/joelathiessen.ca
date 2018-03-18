import React from "react";
import ReactDOM from "react-dom";
import { Grid, Row, Col } from "react-bootstrap";
import { Jumbo } from "./jumbo";
import { Main } from "./main";

export class MainGrid extends React.Component {
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
