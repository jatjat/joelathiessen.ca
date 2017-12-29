import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import { About } from './about'
import { Resume } from './resume'
import { Robots } from './robots'
import { MainGrid } from './mainGrid'
import { App } from './app'

class Root extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
          <Route path="/" component={App}>
              <IndexRedirect to="/main" />
              <Route path="/main" component={MainGrid} />
              <Route path="/resume" component={Resume} />
              <Route path="/robots" component={Robots} />
              <Route path="/about" component={About} />
          </Route>
      </Router>
      );
  }
}

ReactDOM.render(<Root />, document.getElementById('app'))
