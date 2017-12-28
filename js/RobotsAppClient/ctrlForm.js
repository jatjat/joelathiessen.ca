import React from 'react';
import { Button, ButtonGroup, ButtonToolbar, ControlLabel, Glyphicon, FormGroup, FormControl, HelpBlock} from 'react-bootstrap';
import Validator from 'validator';

export class CtrlForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      numParticles: "",
      sensorDistVar: "",
      sensorAngVar: ""
    }
    this.MAX_PARTICLES = 100;
    this.DEFAULT_NUM_PARTICLES = 20;
    this.DEFAULT_DIST_VAR = 0.5;
    this.DEFAULT_ANG_VAR = 0.01;

    this.handleNumParticlesChange = ::this.handleNumParticlesChange;
    this.handleSensorDistVarChange = ::this.handleSensorDistVarChange;
    this.handleSensorAngVarChange = ::this.handleSensorAngVarChange;
    this.handleApplyButtonClick = ::this.handleApplyButtonClick;
  }

  handleNumParticlesChange(e) {
    this.setState({
      numParticles: e.target.value
    });
  }

  handleSensorDistVarChange(e) {
    this.setState({
      sensorDistVar: e.target.value
    });
  }

  handleSensorAngVarChange(e) {
    this.setState({
      sensorAngVar: e.target.value
    });
  }

  handleApplyButtonClick() {
    if (this.props.connected == "connected"
      && this.getNumParticlesValidationState() != 'error'
      && this.getSensorAngVarValidationState() != 'error'
      && this.getSensorDistVarValidationState() != 'error') {

      var nParticles = this.DEFAULT_NUM_PARTICLES;
      if (this.state.numParticles != "") {
        nParticles = parseFloat(this.state.numParticles)
      }
      var sDistVar = this.DEFAULT_DIST_VAR;
      if (this.state.sensorDistVar != "") {
        sDistVar = parseFloat(this.state.sensorDistVar)
      }
      var sAngVar = this.DEFAULT_ANG_VAR;
      if (this.state.sensorAngVar != "") {
        sAngVar = parseFloat(this.state.sensorAngVar)
      }

      var applyMsg = {
        msgType: "slamSettings",
        msg: {
          numParticles: nParticles,
          sensorDistVar: sDistVar,
          sensorAngVar: sAngVar
        }
      }
      this.props.onCtrlMsg(applyMsg);
    }
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

  getSensorDistVarValidationState(includeMsg) {
    var validity = null;
    var msg = null;
    if (Validator.isFloat(this.state.sensorDistVar, {
        min: 0
      })) {
      validity = "success";
    } else if (Validator.isFloat(this.state.sensorDistVar)) {
      validity = "error";
      msg = "A positive number is required";
    } else if (this.state.sensorDistVar != "") {
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

  getSensorAngVarValidationState(includeMsg) {
    var validity = null;
    var msg = null;
    if (Validator.isFloat(this.state.sensorAngVar, {
        min: 0
      })) {
      validity = "success";
    } else if (Validator.isFloat(this.state.sensorAngVar)) {
      validity = "error";
      msg = "A positive number is required";
    } else if (this.state.sensorAngVar != "") {
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

  render() {
    var numParticlesHelpBlock = null;
    var numPartValidity = this.getNumParticlesValidationState(true);
    if (numPartValidity.validity != 'success') {
      numParticlesHelpBlock = (<HelpBlock>
                                   {numPartValidity.msg}
                               </HelpBlock>
      );
    }
    var sensorDistVarHelpBlock = null;
    var sensorDistVarValidity = this.getSensorDistVarValidationState(true);
    if (sensorDistVarValidity.validity != 'success') {
      sensorDistVarHelpBlock = (<HelpBlock>
                                    {sensorDistVarValidity.msg}
                                </HelpBlock>
      );
    }
    var sensorAngVarHelpBlock = null;
    var sensorAngVarValidity = this.getSensorAngVarValidationState(true);
    if (sensorAngVarValidity.validity != 'success') {
      sensorAngVarHelpBlock = (<HelpBlock>
                                   {sensorAngVarValidity.msg}
                               </HelpBlock>
      );
    }
    return (
      <form>
          <FormGroup controlId="numParticlesForm" validationState={this.getNumParticlesValidationState()}>
              <ControlLabel>Number of Particles</ControlLabel>
              <FormControl type="text" value={this.state.numParticles} placeholder={"Number of particles (1-" + this.MAX_PARTICLES + "), default: " + this.DEFAULT_NUM_PARTICLES + ")"} onChange={this.handleNumParticlesChange} />
              <FormControl.Feedback />
              {numParticlesHelpBlock}
          </FormGroup>
          <FormGroup controlId="sensorDistVarForm" validationState={this.getSensorDistVarValidationState()}>
              <ControlLabel>Hypothetical sensor distance variance</ControlLabel>
              <FormControl type="text" value={this.state.sensorDistVar} placeholder={"Hypothetical variance (default: " + this.DEFAULT_DIST_VAR + " units)"} onChange={this.handleSensorDistVarChange} />
              <FormControl.Feedback />
              {sensorDistVarHelpBlock}
          </FormGroup>
          <FormGroup controlId="sensorAngVarForm" validationState={this.getSensorAngVarValidationState()}>
              <ControlLabel>Hypothetical sensor angle variance</ControlLabel>
              <FormControl type="text" value={this.state.sensorAngVar} placeholder={"Hypothetical variance (default: " + this.DEFAULT_ANG_VAR + " radians)"} onChange={this.handleSensorAngVarChange} />
              <FormControl.Feedback />
              {sensorAngVarHelpBlock}
          </FormGroup>
          <ButtonToolbar justified>
              <ButtonGroup>
                  <Button bsStyle="info" onClick={this.props.openHelpModal}>
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
      );
  }
}
