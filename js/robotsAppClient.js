import React from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, ButtonToolbar, ControlLabel, Glyphicon, Grid, FormGroup, FormControl, HelpBlock, Row, Col, Panel } from 'react-bootstrap';
import Validator from 'validator';
import IO from 'socket.io-client';
import Leaflet from 'leaflet';

export class RobotsApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: "uninitialized",
      numParticles: "",
      sensorDistStdev: "",
      sensorAngStdev: ""
    }
    this.io = IO(this.props.namespace, {
      reconnect: true,
      'connect timeout': 5000
    });
    this.handleNumParticlesChange = this.handleNumParticlesChange.bind(this);
    this.handleSensorDistStdevChange = this.handleSensorDistStdevChange.bind(this);
    this.handleSensorAngStdevChange = this.handleSensorAngStdevChange.bind(this);
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

  getNumParticlesValidationState(includeMsg) {

    var validity = null;
    var msg = null;
    if (Validator.isInt(this.state.numParticles, {
        min: 1,
        max: 50
      })) {
      validity = "success";
    } else if (Validator.isInt(this.state.numParticles, {
        min: 51,
        max: 100
      })) {
      validity = "warning";
      msg = "A large number of particles may result in diminished localization returns";
    } else if (Validator.isInt(this.state.numParticles)) {
      validity = "error";
      msg = "An integer between 1 and 100 is required";
    } else if (this.state.numParticles != "") {
      validity = "error";
      msg = "A valid integer is required";
    }

    if (includeMsg == true) {
      return {
        validity: validity,
        msg: msg
      };
    } else {
      return validity;
    }
  }

  handleNumParticlesChange(e) {
    this.setState({
      numParticles: e.target.value
    });
  }

  getSensorDistStdevValidationState(includeMsg) {

    var validity = null;
    var msg = null;
    if (Validator.isFloat(this.state.sensorDistStdev, {
        min: 0
      })) {
      validity = "success";
    } else if (Validator.isFloat(this.state.sensorDistStdev)) {
      validity = "error";
      msg = "A positive number is required";
    } else if (this.state.sensorDistStdev != "") {
      validity = "error";
      msg = "A valid postive number is required";
    }

    if (includeMsg == true) {
      return {
        validity: validity,
        msg: msg
      };
    } else {
      return validity;
    }
  }

  handleSensorDistStdevChange(e) {
    this.setState({
      sensorDistStdev: e.target.value
    });
  }

  getSensorAngStdevValidationState(includeMsg) {

    var validity = null;
    var msg = null;
    if (Validator.isFloat(this.state.sensorAngStdev, {
        min: 0
      })) {
      validity = "success";
    } else if (Validator.isFloat(this.state.sensorAngStdev)) {
      validity = "error";
      msg = "A positive number is required";
    } else if (this.state.sensorAngStdev != "") {
      validity = "error";
      msg = "A valid positive number is required";
    }

    if (includeMsg == true) {
      return {
        validity: validity,
        msg: msg
      };
    } else {
      return validity;
    }
  }

  handleSensorAngStdevChange(e) {
    this.setState({
      sensorAngStdev: e.target.value
    });
  }

  render() {
    var numParticlesHelpBlock = null;
    var numPartValidity = this.getNumParticlesValidationState(true);
    if (numPartValidity.validity != 'success') {
      numParticlesHelpBlock = (<HelpBlock>
                                   {numPartValidity.msg}
                               </HelpBlock>
      );
    }
    var sensorDistStdevHelpBlock = null;
    var sensorDistStdevValidity = this.getSensorDistStdevValidationState(true);
    if (sensorDistStdevValidity.validity != 'success') {
      sensorDistStdevHelpBlock = (<HelpBlock>
                                      {sensorDistStdevValidity.msg}
                                  </HelpBlock>
      );
    }
    var sensorAngStdevHelpBlock = null;
    var sensorAngStdevValidity = this.getSensorAngStdevValidationState(true);
    if (sensorAngStdevValidity.validity != 'success') {
      sensorAngStdevHelpBlock = (<HelpBlock>
                                     {sensorAngStdevValidity.msg}
                                 </HelpBlock>
      );
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
              <Panel header="FastSLAM Settings">
                  <form>
                      <FormGroup controlId="numParticlesForm" validationState={this.getNumParticlesValidationState()}>
                          <ControlLabel>Number of Particles</ControlLabel>
                          <FormControl type="text" value={this.state.numParticles} placeholder="Number of particles (1-100, default: 10)" onChange={this.handleNumParticlesChange} />
                          <FormControl.Feedback />
                          {numParticlesHelpBlock}
                      </FormGroup>
                      <FormGroup controlId="sensorDistStdevForm" validationState={this.getSensorDistStdevValidationState()}>
                          <ControlLabel>Hypothetical sensor distance standard deviation</ControlLabel>
                          <FormControl type="text" value={this.state.sensorDistStdev} placeholder="Hypothetical σ (default: 2 units)" onChange={this.handleSensorDistStdevChange} />
                          <FormControl.Feedback />
                          {sensorDistStdevHelpBlock}
                      </FormGroup>
                      <FormGroup controlId="sensorAngStdevForm" validationState={this.getSensorAngStdevValidationState()}>
                          <ControlLabel>Hypothetical sensor angle standard deviation</ControlLabel>
                          <FormControl type="text" value={this.state.sensorAngStdev} placeholder="Hypothetical σ (default: 1 radian)" onChange={this.handleSensorAngStdevChange} />
                          <FormControl.Feedback />
                          {sensorAngStdevHelpBlock}
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
    if (this.props.connected == 'uninitialized' && nextProps.connected == 'connected') {
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
