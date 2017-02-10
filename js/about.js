import React from 'react';
import { Image, Grid, Row, Col, Panel } from 'react-bootstrap';

export class About extends React.Component {
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
                      About this website: it's mostly for projects I think are cool, and my resume.
                      <br />
                      <br /> About me: I enjoy reading, robotics, and creating things.
                  </Panel>
                  </Col>
              </Panel>
              </Col>
          </Row>
      </Grid>
      );
  }
}
