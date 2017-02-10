import React from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, ButtonToolbar, Glyphicon, Grid, Modal, Row, Col, Panel } from 'react-bootstrap';
import IO from 'socket.io-client';
import Leaflet from 'leaflet';
import { CtrlForm } from './ctrlForm.js'

export class RobotsApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: "uninitialized",
      showHelpModal: false,
      isRunning: true, // to prevent StartButton from flashing on page load
      resetting: false
    }
    this.handleMapData = null;
    this.history = [];

    this.openHelpModal = ::this.openHelpModal;
    this.closeHelpModal = ::this.closeHelpModal;
    this.setHandleMapData = ::this.setHandleMapData;

    this.handleStartButtonClick = ::this.handleStartButtonClick;
    this.handleResetButtonClick = ::this.handleResetButtonClick;

    this.onCtrlMsg = ::this.onCtrlMsg

    this.io = IO(this.props.namespace, {
      reconnect: true,
    });
    this.io.on('message', (data, flags) => {
      var jsonData = JSON.parse(data);
      this.history += jsonData

      if (this.handleMapData != null) {
        if (jsonData.msgType == "fastSlamInfo" && this.state.resetting == false) {
          this.handleMapData(jsonData.msg);
        } else if (jsonData.msgType == "robotSettings") {
          this.setState({
            isRunning: jsonData.msg.running,
            resetting: jsonData.msg.resetting
          });
        }
      }
    });

    this.io.on('connect', () => {
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

  onCtrlMsg(applyMsg) {
    this.io.emit("message", applyMsg);
  }

  setHandleMapData(handleMapData) {
    this.handleMapData = handleMapData;
  }

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

  handleStartButtonClick() {
    if (this.state.connected == "connected") {
      var startMsg = {
        msgType: "robotSettings",
        msg: {
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
        msgType: "robotSettings",
        msg: {
          running: this.state.isRunning,
          resetting: true
        }
      }
      this.setState({
        resetting: true
      })
      this.io.emit("message", resetMsg);
    }
  }

  render() {
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
                      A robot implementing FastSLAM has particles each representing a possible robot pose (position and orientation). For a given step of the algorithm, the robot combines odometry and measurements to all the features that its sensors can see, as if from each of its particles. If a feature has been seen before in the position that a particle expects, (i.e. it corresponds to a landmark, the weight of the particle is adjusted based on how good the match is. Otherwise the feature is added as a new landmark. Finally, the particles are replaced with copies of the highest weighted particles. You can read more <a href="http://robots.stanford.edu/papers/montemerlo.fastslam-tr.pdf">here.</a>
                  </p>
                  <h5>Number of Particles:</h5> FastSLAM is O(mlog(n)) where m is the number of particles, and n the number of landmarks. While more particles cause better accuracy, in aggregate they are expensive, and you may get excellent results even with 5-10 particles! There is experimental support for viewing up to 10.
                  <p>
                  </p>
                  <h5>Hypothetical sensor distance & angle variances:</h5>
                  <p>
                      {"FastSLAM guesses the accuracy of its sensors. The real standard deviations for a measurement from this robot's sensor are 0.001 distance units and 0.001 radians (1/10th the odometry standard deviations). Tuning the guesses may produce better results."}
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
                      <RMap resetting={this.state.resetting} mapDataHandler={this.setHandleMapData} />
                  </Panel>
                  </Col>
                  <Col xs={12} md={4} mdPull={8}>
                  <Panel header="FastSLAM Settings">
                      <CtrlForm openHelpModal={this.openHelpModal} connected={this.state.connected} onCtrlMsg={this.onCtrlMsg} />
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
    this.handleMapData = ::this.handleMapData;
    this.resetMap = ::this.resetMap;
  }
  componentDidMount() {
    this.initialize();
    this.props.mapDataHandler(this.handleMapData);
  }

  componentWillUnmount() {
    this.map = null;
  }

  resetMap() {
    this.map.off();
    this.map.remove();
    this.initialize();
  }

  initialize() {
    this.oldOdoX = null;
    this.oldOdoY = null;
    this.oldTrueY = null;
    this.oldTrueX = null;
    this.oldBestY = null;
    this.oldBestX = null;
    this.timesHandledMapData = 0;
    const startBounds = [[90, 150], [230, 470]];
    this.map = Leaflet.map(ReactDOM.findDOMNode(this), {
      crs: Leaflet.CRS.Simple,
      preferCanvas: true,
      minZoom: 0,
    });
    this.map.fitBounds(startBounds);
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

  // It is prohibitively expensive to handle new map data by passing it as new props
  handleMapData(jsonData) {

    // Unmodifed Leaflet isn't really designed to render
    // a large number of particles in realtime
    // TODO: use a more efficent Canvas, or WebGL, based renderer?
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

    var odoY = jsonData.odoPose.y;
    var odoX = jsonData.odoPose.x;
    if (this.oldOdoY && this.oldOdoX) {
      this.odoPathLayerGroup.addData({
        type: "LineString",
        coordinates: [[this.oldOdoY, this.oldOdoX], [odoY, odoX]]
      });
    }
    this.oldOdoY = odoY;
    this.oldOdoX = odoX;

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

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.resetting == false && this.props.resetting == true) {
      this.resetMap()
    }
  }

  render() {
    return (<div className="map" />);
  }
}
RMap.propTypes = {
  mapDataHandler: React.PropTypes.func.isRequired,
  resetting: React.PropTypes.bool.isRequired
}
