import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, Row, Col, Panel, Well } from 'react-bootstrap';
import { ReactPDF } from './pdfViewer';
import { rotl33tStr } from './util'

export class Resume extends React.Component {
  static defaultProps = {
    resSrc: rotl33tStr("/choyvp/erf.cqs")
  }
  static propTypes = {
    resSrc: React.PropTypes.string.isRequired
  }

  render() {
    return (
      <Grid>
          <Row>
              <Col xs={12} md={9}>
              <Panel>
                  <Col xs={12} md={9}> A viewable copy of my resume is included below <a id="resumeDownloadLink" href={this.props.resSrc} download="JoelThiessenResume.pdf">(direct link)</a>.
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
