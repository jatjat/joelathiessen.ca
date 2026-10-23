import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { About } from "./about";
import { Resume } from "./resume";
import { Robots } from "./robots";
import { MainGrid } from "./mainGrid";
import { App } from "./app";
import "bootstrap/dist/css/bootstrap.min.css";

class Root extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <App />
          <Switch>
            <Route exact path="/" component={MainGrid} />
            <Route path="/resume" component={Resume} />
            <Route path="/robots" component={Robots} />
            <Route path="/about" component={About} />
          </Switch>
        </div>
      </Router>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById("app"));
