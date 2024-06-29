import {
  Cartesian3,
  Math as CesiumMath,
  Terrain,
  Viewer,
  Ion,
  createOsmBuildingsAsync,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTJiMWEzMS01NTRkLTRlNGItYWRjOS0zNDU4NzQzMTMzNmYiLCJpZCI6ODA5MzgsImlhdCI6MTY0MzI5NjkxOH0.YqLHrHZ7JW55Ndbx5ZUEeBQ3oGnDNnbrnP3dn3AB7TE";

const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
  skyBox: false,
  skyAtmosphere: false,
  infoBox: false,
  animation: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  sceneModePicker: false,
  homeButton: false,
  geocoder: false,
  fullscreenButton: false,
  timeline: false,
  creditContainer: document.createElement("none"),
});

viewer.camera.flyTo({
  destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-15.0),
  },
});

createOsmBuildingsAsync().then((buildingTileset) => {
  viewer.scene.primitives.add(buildingTileset);
});
