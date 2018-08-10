import React from "react";
import { Button, Glyphicon } from "react-bootstrap";

type Props = {
  running: boolean;
  onClick: (event: React.MouseEvent<Button>) => void;
};

type State = {};

export class StartButton extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  render() {
    var button;
    if (this.props.running) {
      button = (
        <Button bsStyle="warning" onClick={this.props.onClick}>
          <Glyphicon glyph="pause" /> Pause
        </Button>
      );
    } else {
      button = (
        <Button bsStyle="success" onClick={this.props.onClick}>
          <Glyphicon glyph="play" /> Start
        </Button>
      );
    }
    return button;
  }
}
