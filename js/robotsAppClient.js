import React from 'react';
var Io = require('socket.io-client');

export class RobotsApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: "disconnected",
    }
  }
  componentDidMount() {
    this.io = Io(this.props.namespace, {
      reconnect: true,
      'connect timeout': 5000
    });

    this.io.on('connect', () => {
      this.setState({
        connected: "connected"
      });
      console.log("connected");
    });

    this.io.on('disconnect', (data) => {
      this.setState({
        connected: "disconnected"
      });
      console.log("disconnected");
    });

    this.io.on('error', (error) => {
      this.setState({
        connected: "failed"
      });
      console.log(error);
    });

  }

  componentWillUnmount() {
    this.io.disconnect();
  }

  render() {
    return (
      <div>RobotsApp!
          {this.state.connected}
      </div>
      );
  }
}
RobotsApp.propTypes = {
  namespace: React.PropTypes.string.isRequired
}
