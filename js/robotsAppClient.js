import React from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, ButtonToolbar, ControlLabel, Glyphicon, Grid, FormGroup, FormControl, HelpBlock, Modal, Row, Col, Panel } from 'react-bootstrap';
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
      sensorAngStdev: "",
      showHelpModal: false,
      isRunning: true // to prevent StartButton from flashing on page load
    }
    this.MAX_PARTICLES = 100;
    this.DEFAULT_NUM_PARTICLES = 10;
    this.DEFAULT_DIST_STDEV = 0.1;
    this.DEFAULT_ANG_STDEV = 0.1;
    this.rMap = null;
    this.history = [];

    this.handleNumParticlesChange = this.handleNumParticlesChange.bind(this);
    this.handleSensorDistStdevChange = this.handleSensorDistStdevChange.bind(this);
    this.handleSensorAngStdevChange = this.handleSensorAngStdevChange.bind(this);
    this.openHelpModal = this.openHelpModal.bind(this);
    this.closeHelpModal = this.closeHelpModal.bind(this);
    this.handleMadeRMap = this.handleMadeRMap.bind(this);
    this.handleStartButtonClick = this.handleStartButtonClick.bind(this);
    this.handleApplyButtonClick = this.handleApplyButtonClick.bind(this);
    this.handleResetButtonClick = this.handleResetButtonClick.bind(this);

    this.io = IO(this.props.namespace, {
      reconnect: true,
    });
    this.io.on('message', (data, flags) => {
      var jsonData = JSON.parse(data);
      this.history += jsonData

      if (this.state.isRunning == false) {
        this.setState({
          isRunning: true
        });
      }
      if (this.rMap != null) {
        this.rMap.handleMapData(jsonData);
      }
    });

    this.io.on('connect', () => {

      if (this.state.connected == "disconnected") {
        this.rMap.initialize();
      }
      this.setState({
        connected: "connected",
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

  handleMadeRMap(rMap) {
    this.rMap = rMap;
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.io.disconnect();
  }

  openHelpModal() {
    this.setState({
      showHelpModal: true
    });
  }

  closeHelpModal() {
    this.setState({
      showHelpModal: false
    });
  }

  getNumParticlesValidationState(includeMsg) {

    var validity = null;
    var msg = null;
    if (Validator.isInt(this.state.numParticles, {
        min: 1,
        max: this.MAX_PARTICLES / 2
      })) {
      validity = "success";
    } else if (Validator.isInt(this.state.numParticles, {
        min: 1 + this.MAX_PARTICLES / 2,
        max: this.MAX_PARTICLES
      })) {
      validity = "warning";
      msg = "A large number of particles may result in diminished localization returns";
    } else if (Validator.isInt(this.state.numParticles)) {
      validity = "error";
      msg = "An integer between 1 and " + this.MAX_PARTICLES + " is required";
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


  handleApplyButtonClick() {
    if (this.state.connected == "connected"
      && this.getNumParticlesValidationState() != 'error'
      && this.getSensorAngStdevValidationState() != 'error'
      && this.getSensorDistStdevValidationState() != 'error') {


      var nParticles = this.DEFAULT_NUM_PARTICLES;
      if (this.state.numParticles != "") {
        nParticles = parseFloat(this.state.numParticles)
      }
      var sDistStdev = this.DEFAULT_DIST_STDEV;
      if (this.state.sensorDistStdev != "") {
        sDistStdev = parseFloat(this.state.sensorDistStdev)
      }
      var sAngStdev = this.DEFAULT_ANG_STDEV;
      if (this.state.sensorAngStdev != "") {
        sAngStdev = parseFloat(this.state.sensorAngStdev)
      }

      var applyMsg = {
        "msgType": "fastSlamSettings",
        "msg": {
          numParticles: nParticles,
          sensorDistStdev: sDistStdev,
          sensorAngStdev: sAngStdev
        }
      }

      this.io.emit("message", applyMsg);
    }
  }

  handleStartButtonClick() {
    if (this.state.connected == "connected") {
      var startMsg = {
        "msgType": "robotSettings",
        "msg": {
          running: !this.state.isRunning,
          resetting: false
        }

      }
      this.io.emit("message", startMsg);
    }
  }

  handleResetButtonClick() {

    if (this.state.connected == "connected") {
      var resetMsg = {
        "msgType": "robotSettings",
        "msg": {
          running: this.state.isRunning,
          resetting: true
        }
      }
      this.io.emit("message", resetMsg);
    }
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
      <div>
          <Modal show={this.state.showHelpModal} onHide={this.closeHelpModal}>
              <Modal.Header closeButton>
                  <Modal.Title>What do these settings do? And what is FastSLAM?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <h5>What is FastSLAM?</h5>
                  <p>
                      FastSLAM is an algorithm that lets an agent like a robot keep an accurate map with information about where it has been, and what it has seen, using odometric and laser or video sensor data.
                  </p>
                  <p>
                      A robot implementing FastSLAM has particles each representing a possible robot <i>pose</i> (position and orientation). For a given step of the algorithm, the robot combines odometry and measurements to all the <i>features</i> that its sensors can see, as if from each of its particles. If a feature has been seen before in the position that a particle expects, (i.e. it corresponds to a <i>landmark</i>), the <i>weight</i> of the particle is adjusted based on how good the match is. Otherwise the feature is added as a new landmark. Finally, the particles are replaced with copies of the highest weighted particles. You can read more <a href="http://robots.stanford.edu/papers/montemerlo.fastslam-tr.pdf">here.</a>
                  </p>
                  <h5>Number of Particles:</h5> FastSLAM is O(mlog(n)) where m is the number of particles, and n the number of landmarks. While more particles cause better accuracy, in aggregate they are expensive, and you may get excellent results even with 5-10 particles! There is experimental support for viewing up to 10.
                  <p>
                  </p>
                  <h5>Hypothetical sensor distance & angle standard deviations:</h5>
                  <p>
                      {"FastSLAM guesses the accuracy of its sensors. The real accuracies of this robot's sensor are σ = " + this.DEFAULT_DIST_STDEV + " distance units and σ = " + this.DEFAULT_ANG_STDEV + " radians. Tuning the guesses may produce better results."}
                  </p>
              </Modal.Body>
              <Modal.Footer>
                  <Button onClick={this.closeHelpModal}>Close</Button>
              </Modal.Footer>
          </Modal>
          <Grid>
              <Row>
                  <Col xs={12} md={8} mdPush={4}>
                  <Panel className="mapPanel">
                      <RMap onRMapMounted={this.handleMadeRMap} />
                  </Panel>
                  </Col>
                  <Col xs={12} md={4} mdPull={8}>
                  <Panel header="FastSLAM Settings">
                      <form>
                          <FormGroup controlId="numParticlesForm" validationState={this.getNumParticlesValidationState()}>
                              <ControlLabel>Number of Particles</ControlLabel>
                              <FormControl type="text" value={this.state.numParticles} placeholder={"Number of particles (1-" + this.MAX_PARTICLES + "), default: " + this.DEFAULT_NUM_PARTICLES + ")"} onChange={this.handleNumParticlesChange} />
                              <FormControl.Feedback />
                              {numParticlesHelpBlock}
                          </FormGroup>
                          <FormGroup controlId="sensorDistStdevForm" validationState={this.getSensorDistStdevValidationState()}>
                              <ControlLabel>Hypothetical sensor distance standard deviation</ControlLabel>
                              <FormControl type="text" value={this.state.sensorDistStdev} placeholder={"Hypothetical σ (default: " + this.DEFAULT_DIST_STDEV + " units)"} onChange={this.handleSensorDistStdevChange} />
                              <FormControl.Feedback />
                              {sensorDistStdevHelpBlock}
                          </FormGroup>
                          <FormGroup controlId="sensorAngStdevForm" validationState={this.getSensorAngStdevValidationState()}>
                              <ControlLabel>Hypothetical sensor angle standard deviation</ControlLabel>
                              <FormControl type="text" value={this.state.sensorAngStdev} placeholder={"Hypothetical σ (default: " + this.DEFAULT_ANG_STDEV + " radians)"} onChange={this.handleSensorAngStdevChange} />
                              <FormControl.Feedback />
                              {sensorAngStdevHelpBlock}
                          </FormGroup>
                          <ButtonToolbar justified>
                              <ButtonGroup>
                                  <Button bsStyle="info" onClick={this.openHelpModal}>
                                      <Glyphicon glyph="question-sign" /> What do these settings do?
                                  </Button>
                              </ButtonGroup>
                              <ButtonGroup>
                                  <Button bsStyle="primary" onClick={this.handleApplyButtonClick}>
                                      <Glyphicon glyph="ok" /> Apply
                                  </Button>
                              </ButtonGroup>
                          </ButtonToolbar>
                      </form>
                  </Panel>
                  <Panel header="Simulation Settings">
                      <ButtonToolbar>
                          <ButtonGroup>
                              <Button bsStyle="danger" onClick={this.handleResetButtonClick}>
                                  <Glyphicon glyph="remove-circle" /> Reset Simulation
                              </Button>
                          </ButtonGroup>
                          <ButtonGroup>
                              <StartButton running={this.state.isRunning} onClick={this.handleStartButtonClick} />
                          </ButtonGroup>
                      </ButtonToolbar>
                  </Panel>
                  </Col>
              </Row>
          </Grid>
      </div>
      );
  }
}
RobotsApp.propTypes = {
  namespace: React.PropTypes.string.isRequired
}

class StartButton extends React.Component {
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


class RMap extends React.Component {

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const startBounds = [[90, 150], [230, 470]];
    this.map = Leaflet.map(ReactDOM.findDOMNode(this), {
      crs: Leaflet.CRS.Simple,
      preferCanvas: true,
      minZoom: -2,
    });
    this.map.fitBounds(startBounds);
    this.initialize();
    this.props.onRMapMounted(this);
  }

  componentWillUnmount() {
    this.map = null;
  }

  initialize() {
    this.oX = null;
    this.oY = null;
    this.timesHandledMapData = 0;
    this.bestPath = Leaflet.geoJSON(null, {
      style: {
        color: "blue",
        weight: 4,
        opacity: 0.3
      }
    });
    this.odoPathLayerGroup = Leaflet.geoJSON(null, {
      style: {
        color: "red",
        weight: 4,
        opacity: 0.3
      }
    });
    this.truePath = Leaflet.geoJSON(null, {
      style: {
        color: "green",
        weight: 4,
        opacity: 0.3
      }
    });
    this.particles = Leaflet.layerGroup([]);
    this.landmarks = Leaflet.layerGroup([]);
    this.refreshStaticMapLayersRequested = true;
    var overlayLayers = {
      "FastSLAM Path": this.bestPath,
      "Odometric Path": this.odoPathLayerGroup,
      "True Path": this.truePath,
      "Particles (experimental!)": this.particles,
      "Landmarks": this.landmarks
    };

    // Leaflet will stop displaying new data after a
    // reconnection unless its layers are reset
    if (this.overlayLayersControl != null) {
      this.map.removeControl(this.overlayLayersControl);
      this.map.eachLayer((layer) => {
        this.map.removeLayer(layer);
      });
    }
    this.map.addLayer(this.bestPath);
    this.map.addLayer(this.odoPathLayerGroup);
    this.map.addLayer(this.truePath);
    this.map.addLayer(this.particles);
    this.map.addLayer(this.landmarks);

    this.overlayLayersControl = Leaflet.control.layers(null, overlayLayers);
    this.overlayLayersControl.addTo(this.map);
    console.log("map initialized");
  }

  // It is prohibitively slow to handle new map data by passing it as props to be
  // applied to the map in the render method
  handleMapData(jsonData) {

    // Unmodifed Leaflet isn't really designed to render
    // a large number of particles
    // TODO: use a more efficent Canvas (or WebGL) based renderer?
    this.timesHandledMapData++
    if (this.timesHandledMapData > 2000) {
      this.map.removeLayer(this.particles);
    }

    if (this.refreshStaticMapLayersRequested) {
      jsonData.trueLandmarks.map((pnt) => {
        this.landmarks.addLayer(Leaflet.circleMarker([pnt.x, pnt.y], {
          radius: 5,
          fillColor: "green",
          fillOpacity: 1,
          stroke: false
        }));
      });
      this.refreshStaticMapLayersRequested = false;
    }

    var particleLayersList = jsonData.particles.slice(0, Math.min(jsonData.particles.length, 10)).map((pnt) => {
      return Leaflet.circleMarker([pnt.x, pnt.y], {
        radius: 1,
        opacity: 0.1
      });
    });
    var newParticlesLayerGroup = Leaflet.layerGroup(particleLayersList);
    this.particles.addLayer(newParticlesLayerGroup);

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
    var trueY = jsonData.truePose.y;
    var trueX = jsonData.truePose.x;

    if (this.oldTrueY && this.oldTrueX) {
      this.truePath.addData({
        type: "LineString",
        coordinates: [[this.oldTrueY, this.oldTrueX], [trueY, trueX]]
      });
    }
    this.oldTrueY = trueY;
    this.oldTrueX = trueX;

    var bestY = jsonData.bestPose.y;
    var bestX = jsonData.bestPose.x;

    if (this.oldBestY && this.oldBestX) {
      this.bestPath.addData({
        type: "LineString",
        coordinates: [[this.oldBestY, this.oldBestX], [bestY, bestX]]
      });
    }
    this.oldBestY = bestY;
    this.oldBestX = bestX;
  }

  render() {
    return (<div className="map" />);
  }
}
RMap.propTypes = {
  onRMapMounted: React.PropTypes.func.isRequired
}
