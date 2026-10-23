import React from "react";
import { Panel } from "react-bootstrap";
import { Link } from "react-router-dom";

export class Main extends React.Component {
  render() {
    return (
      <Panel>
        <p>
          <span>
            You can see{" "}
            <Link id="aboutLink" to="/about">
              my
            </Link>{" "}
            resume{" "}
          </span>
          <Link id="resumeLink" to="/resume">
            here
          </Link>
        </p>
        <p>
          <span>If you want to see the source-code for this </span>
          <a
            id="webGitHubLink"
            href="https://github.com/jatjat/joelathiessen.ca"
          >
            website
          </a>
          <span>, or my </span>
          <a id="fastSLAMGitHubLink" href="https://github.com/jatjat/kaly2">
            FastSLAM demo
          </a>
          <span>, my GitHub is </span>
          <a id="parentGitHubLink" href="https://github.com/jatjat">
            here.
          </a>
        </p>
      </Panel>
    );
  }
}
