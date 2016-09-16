import React from 'react';
import ReactDOM from 'react-dom';
import { ControlLabel, Grid, FormGroup, FormControl, HelpBlock, Row, Col, Panel } from 'react-bootstrap';
import Validator from 'validator';
import IO from 'socket.io-client';
import Leaflet from 'leaflet';

export class RobotsApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: "disconnected",
      numParticles: ""
    }
    this.io = IO(this.props.namespace, {
      reconnect: true,
      'connect timeout': 5000
    });
    this.handleNumParticlesChange = this.handleNumParticlesChange.bind(this)
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

  validateForm() {}
  onSubmit() {}
  getNumParticlesValidationState() {
    if (Validator.isInt(this.state.numParticles, {
        min: 1,
        max: 75
      })) {
      return "success";
    } else if (Validator.isInt(this.state.numParticles, {
        min: 75,
        max: 100
      })) {
      return "warning";
    } else if (this.state.numParticles != "") {
      return "error";
    }
  }

  handleNumParticlesChange(e) {
    this.setState({
      numParticles: e.target.value
    });
  }

  render() {
    var helpBlock = null;

    if (this.getNumParticlesValidationState() == 'error') {
      helpBlock = (<HelpBlock>Between 1 and 100 particles are required</HelpBlock>
      )
    }
    return (
      <Grid>
          <Row>
              <Col xs={12} md={8} mdPush={4}>
              <Panel className="mapPanel">
                  <RMap io={this.io} connected={this.state.connected} />
              </Panel>
              </Col>
              <Col xs={12} md={4} mdPull={8}>
              <Panel>
                  <form>
                      <FormGroup controlId="numParticlesForm" validationState={this.getNumParticlesValidationState()}>
                          <ControlLabel>Number of Particles</ControlLabel>
                          <FormControl type="text" value={this.state.numParticles} placeholder="Number of particles (1-100)" onChange={this.handleNumParticlesChange} />
                          <FormControl.Feedback />
                          {helpBlock}
                      </FormGroup>
                  </form>
              </Panel>
              </Col>
          </Row>
      </Grid>
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

  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.connected != 'connected' && nextProps.connected == 'connected') {
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
  }

  componentWillUnmount() {
    this.map = null;
  }

  render() {
    return (<div className="map" />);
  }
}
RMap.propTypes = {
  io: React.PropTypes.object.isRequired,
  connected: React.PropTypes.string.isRequired
}
