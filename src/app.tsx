import React from 'react';
import { TopBar } from './topBar'

export class App extends React.Component {
  render() {
    return (
      <div>
          <div>
              <TopBar />
          </div>
          {this.props.children}
      </div>
      );
  }
}
