import React from "react";
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Glyphicon,
  Grid,
  Modal,
  Row,
  Col,
  Panel
} from "react-bootstrap";
import IO from "socket.io-client";
import { CtrlForm } from "./ctrlForm";
import { RMap } from "./rMap";
import { StartButton } from "./startButton";
import "../../css/robotApp.css";

type Props = { namespace: string };
type State = {
  connected: string;
  showHelpModal: boolean;
  isRunning: true;
  resetting: boolean;
  sessionID?: number;
};

export class RobotsApp extends React.Component<Props, State> {
  private handleMapData: Function = null;
  private history = [];
  private io = null;

  constructor(props) {
    super(props);
    this.state = {
      connected: "uninitialized",
      showHelpModal: false,
      isRunning: true, // to prevent StartButton from flashing on page load
      resetting: false
    };

    this.openHelpModal = this.openHelpModal.bind(this);
    this.closeHelpModal = this.closeHelpModal.bind(this);
    this.setHandleMapData = this.setHandleMapData.bind(this);

    this.handleStartButtonClick = this.handleStartButtonClick.bind(this);
    this.handleResetButtonClick = this.handleResetButtonClick.bind(this);

    this.onCtrlMsg = this.onCtrlMsg.bind(this);

    this.io = IO(this.props.namespace, {
      reconnect: true
    });
    this.io.on("message", (data, flags) => {
      const jsonData = JSON.parse(data);
      this.history += jsonData;

      if (this.handleMapData != null) {
        if (jsonData.msgType == "slamInfo" && this.state.resetting == false) {
          this.handleMapData(jsonData.msg);
        } else if (jsonData.msgType == "robotSessionSettings") {
          this.setState({
            isRunning: jsonData.msg.isRunning,
            resetting: jsonData.msg.hasJustReset
          });
        } else if (jsonData.msgType == "connectionOpen") {
          const subscribeMsg = {
            msgType: "robotSessionSubscribe",
            msg: {
              sessionID: this.state.sessionID // starts as null to request new session on first connection
            }
          };
          this.io.emit("message", subscribeMsg);
        } else if (
          jsonData.msgType == "robotSessionSubscribe" &&
          jsonData.msg.success
        ) {
          this.setState({
            sessionID: jsonData.msg.sessionID
          });
          const startMsg = {
            msgType: "robotSessionSettings",
            msg: {
              sessionID: this.state.sessionID,
              shouldRun: true,
              shouldReset: false
            }
          };
          this.io.emit("message", startMsg);
        }
      }
    });

    this.io.on("connect", () => {
      this.setState({
        connected: "connected"
      });
      console.log("connected");
    });

    this.io.on("disconnect", data => {
      this.setState({
        connected: "disconnected"
      });
      console.log("disconnected");
    });

    this.io.on("error", error => {
      this.setState({
        connected: "failed"
      });
      console.log(error);
    });
  }

  onCtrlMsg(applyMsg) {
    applyMsg.msg.sessionID = this.state.sessionID;
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
      const startMsg = {
        msgType: "robotSessionSettings",
        msg: {
          sessionID: this.state.sessionID,
          shouldRun: !this.state.isRunning,
          shouldReset: false
        }
      };
      this.io.emit("message", startMsg);
    }
  }

  handleResetButtonClick() {
    if (this.state.connected == "connected") {
      const resetMsg = {
        msgType: "robotSessionSettings",
        msg: {
          sessionID: this.state.sessionID,
          shouldRun: this.state.isRunning,
          shouldReset: true
        }
      };
      this.setState({
        resetting: true
      });
      this.io.emit("message", resetMsg);
    }
  }

  render() {
    return (
      <div>
        <Modal show={this.state.showHelpModal} onHide={this.closeHelpModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              What do these settings do? And what is FastSLAM?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>What is FastSLAM?</h5>
            <p>
              FastSLAM is an algorithm that lets an agent like a robot keep an
              accurate map with information about where it has been, and what it
              has seen, using odometric and laser or video sensor data.
            </p>
            <p>
              A robot implementing FastSLAM has particles each representing a
              possible robot pose (position and orientation). For a given step
              of the algorithm, the robot combines odometry and measurements to
              all the features that its sensors can see, as if from each of its
              particles. If a feature has been seen before in the position that
              a particle expects, (i.e. it corresponds to a landmark, the weight
              of the particle is adjusted based on how good the match is.
              Otherwise the feature is added as a new landmark. Finally, the
              particles are replaced with copies of the highest weighted
              particles. You can read more{" "}
              <a href="http://robots.stanford.edu/papers/montemerlo.fastslam-tr.pdf">
                here.
              </a>
            </p>
            <h5>Number of Particles:</h5> FastSLAM is O(mlog(n)) where m is the
            number of particles, and n the number of landmarks. While more
            particles cause better accuracy, in aggregate they are expensive,
            and you may get excellent results even with 5-10 particles! There is
            experimental support for viewing up to 10.
            <p />
            <h5>Hypothetical sensor distance & angle variances:</h5>
            <p>
              {
                "FastSLAM guesses the accuracy of its sensors. The real standard deviations for a measurement from this robot's sensor are 0.001 distance units and 0.001 radians (1/10th the odometry standard deviations). Tuning the guesses may produce better results."
              }
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
                <RMap
                  resetting={this.state.resetting}
                  mapDataHandler={this.setHandleMapData}
                />
              </Panel>
            </Col>
            <Col xs={12} md={4} mdPull={8}>
              <Panel header="FastSLAM Settings">
                <CtrlForm
                  openHelpModal={this.openHelpModal}
                  connected={this.state.connected}
                  onCtrlMsg={this.onCtrlMsg}
                />
              </Panel>
              <Panel header="Simulation Settings">
                <ButtonToolbar>
                  <ButtonGroup>
                    <Button
                      bsStyle="danger"
                      onClick={this.handleResetButtonClick}
                    >
                      <Glyphicon glyph="remove-circle" /> Reset Simulation
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    <StartButton
                      running={this.state.isRunning}
                      onClick={this.handleStartButtonClick}
                    />
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
