import React from 'react';
import { RobotsApp } from './RobotsAppClient/robotsAppClient';

export class Robots extends React.Component {
  render() {
    return (<RobotsApp namespace="/" />);
  }
}
