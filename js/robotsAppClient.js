import React from 'react';
import { Panel } from 'react-bootstrap';
import IO from 'socket.io-client';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import Leaflet from 'leaflet';

export class RobotsApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: "disconnected",
    }
  }
  componentDidMount() {
    this.io = IO(this.props.namespace, {
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
    const position = [51.505, -0.09];

    return (
      <div>RobotsApp!
          {this.state.connected}
          <Panel className="mapPanel">
              <Map center={position} zoom={13}>
                  <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png' attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
              </Map>
          </Panel>
      </div>
      );
  }
}
RobotsApp.propTypes = {
  namespace: React.PropTypes.string.isRequired
}
