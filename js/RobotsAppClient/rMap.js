import React from 'react';
import ReactDOM from 'react-dom'
import Leaflet from 'leaflet';

export class RMap extends React.Component {
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
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.resetting == false && this.props.resetting == true) {
      this.resetMap()
    }
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

  render() {
    return (<div className="map" />);
  }
}
RMap.propTypes = {
  mapDataHandler: React.PropTypes.func.isRequired,
  resetting: React.PropTypes.bool.isRequired
}
