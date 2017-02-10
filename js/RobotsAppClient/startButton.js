import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

export class StartButton extends React.Component {
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
StartButton.propTypes = {
  running: React.PropTypes.bool.isRequired,
  onClick: React.PropTypes.func.isRequired
}
