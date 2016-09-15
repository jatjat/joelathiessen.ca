import React from 'react';
import ReactDOM from 'react-dom';
import { Panel } from 'react-bootstrap';
import IO from 'socket.io-client';
import Leaflet from 'leaflet';

export class RobotsApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: "disconnected",
    }
    this.io = IO(this.props.namespace, {
      reconnect: true,
      'connect timeout': 5000
    });
  }
  componentDidMount() {

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
          <Panel className="mapPanel">
              <RMap io={this.io}>
              </RMap>
          </Panel>
      </div>
      );
  }
}
RobotsApp.propTypes = {
  namespace: React.PropTypes.string.isRequired
}

class RMap extends React.Component {

  constructor(props) {
    super(props);
    this.history = [];
  }
  componentDidMount() {
    const startBounds = [[90, 150], [230, 470]];

    this.map = Leaflet.map(ReactDOM.findDOMNode(this), {
      crs: Leaflet.CRS.Simple,
      preferCanvas: true,
      minZoom: -5
    });

    this.map.fitBounds(startBounds);

    this.odoPathLayerGroup = Leaflet.geoJSON(null, {}).addTo(this.map);

    this.props.io.on('message', (data, flags) => {
      var jsonData = JSON.parse(data);
      this.history += jsonData

      var y = jsonData.odoPose.y;
      var x = jsonData.odoPose.x;
      if (this.oY && this.oX) {
        this.odoPathLayerGroup.addData({
          type: "LineString",
          coordinates: [[this.oY, this.oX], [y, x]]
        });
      }
      this.oY = y;
      this.oX = x;
    });
  }

  componentWillUnmount() {
    this.map = null;
  }

  render() {
    return (<div className="map" />);
  }
}
RMap.propTypes = {
  io: React.PropTypes.object.isRequired
}
