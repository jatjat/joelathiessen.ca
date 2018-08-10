import React from "react";
import ReactDOM from "react-dom";
import { Grid, Row, Col, Panel, Well } from "react-bootstrap";
import { ReactPDF } from "./pdfViewer/reactPDF";
import { rotl33tStr } from "./util";

type Props = {
  resSrc: string;
};

type State = {};

export class Resume extends React.Component<Props, State> {
  static defaultProps = {
    // Resolve against the page so it also works under a path prefix
    resSrc: new URL(rotl33tStr("choyvp/erf.cqs"), document.baseURI).href
  };

  render() {
    return (
      <Grid>
        <Row>
          <Col xs={12} md={9}>
            <Panel>
              <Col xs={12} md={9}>
                {" "}
                A viewable copy of my resume is included below{" "}
                <a
                  id="resumeDownloadLink"
                  href={this.props.resSrc}
                  download="JoelThiessenResume.pdf"
                >
                  (direct link)
                </a>.
                <br />
              </Col>
            </Panel>
            <span />
            <Well>
              <ReactPDF src={this.props.resSrc} />
            </Well>
          </Col>
          <Col xs={12} md={9} />
        </Row>
      </Grid>
    );
  }
}
