import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTJiMWEzMS01NTRkLTRlNGItYWRjOS0zNDU4NzQzMTMzNmYiLCJpZCI6ODA5MzgsImlhdCI6MTY0MzI5NjkxOH0.YqLHrHZ7JW55Ndbx5ZUEeBQ3oGnDNnbrnP3dn3AB7TE";

// const viewer = new Cesium.Viewer("cesiumContainer", {
//     baseLayer: Cesium.ImageryLayer.fromProviderAsync(
//       Cesium.TileMapServiceImageryProvider.fromUrl(
//         Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII")
//       )
//     ),
//     baseLayerPicker: false,
//     geocoder: false,
//     animation: false,
//     timeline: false,
//   });

const viewer = new Cesium.Viewer("cesiumContainer", {
  skyAtmosphere: new Cesium.SkyAtmosphere(),
  skyBox: false,
  infoBox: false,
  animation: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  sceneModePicker: false,
  homeButton: false,
  geocoder: false,
  fullscreenButton: false,
  timeline: false,
  globe: false,
  creditContainer: document.createElement("none"),
});
  viewer.extend(Cesium.viewerVoxelInspectorMixin);
//   viewer.scene.debugShowFramesPerSecond = true;
  
  
  
  function ProceduralMultiTileVoxelProvider(shape) {
    this.shape = shape;
    this.minBounds = Cesium.VoxelShapeType.getMinBounds(shape).clone();
    this.maxBounds = Cesium.VoxelShapeType.getMaxBounds(shape).clone();
    this.dimensions = new Cesium.Cartesian3(4, 4, 4);
    this.paddingBefore = new Cesium.Cartesian3(1, 1, 1);
    this.paddingAfter = new Cesium.Cartesian3(1, 1, 1);
    this.names = ["color"];
    this.types = [Cesium.MetadataType.VEC4];
    this.componentTypes = [Cesium.MetadataComponentType.FLOAT32];
  
    this._levelCount = 2;
    this._allVoxelData = new Array(this._levelCount);
  
    const allVoxelData = this._allVoxelData;
    const channelCount = Cesium.MetadataType.getComponentCount(
      this.types[0]
    );
    const { dimensions } = this;
  
    for (let level = 0; level < this._levelCount; level++) {
      const dimAtLevel = Math.pow(2, level);
      const voxelCountX = dimensions.x * dimAtLevel;
      const voxelCountY = dimensions.y * dimAtLevel;
      const voxelCountZ = dimensions.z * dimAtLevel;
      const voxelsPerLevel = voxelCountX * voxelCountY * voxelCountZ;
      const levelData = (allVoxelData[level] = new Array(
        voxelsPerLevel * channelCount
      ));
  
      for (let z = 0; z < voxelCountX; z++) {
        for (let y = 0; y < voxelCountY; y++) {
          const indexZY = z * voxelCountY * voxelCountX + y * voxelCountX;
          for (let x = 0; x < voxelCountZ; x++) {
            const index = (indexZY + x) * channelCount;
            levelData[index + 0] = x / (voxelCountX - 1);
            levelData[index + 1] = y / (voxelCountY - 1);
            levelData[index + 2] = z / (voxelCountZ - 1);
            levelData[index + 3] = 0.5;
          }
        }
      }
    }
  }
  
  ProceduralMultiTileVoxelProvider.prototype.requestData = function (
    options
  ) {
    const { tileLevel, tileX, tileY, tileZ } = options;
  
    if (tileLevel >= this._levelCount) {
      return undefined;
    }
  
    const type = this.types[0];
    const channelCount = Cesium.MetadataType.getComponentCount(type);
    const { dimensions, paddingBefore, paddingAfter } = this;
    const paddedDimensions = Cesium.Cartesian3.fromElements(
      dimensions.x + paddingBefore.x + paddingAfter.x,
      dimensions.y + paddingBefore.y + paddingAfter.y,
      dimensions.z + paddingBefore.z + paddingAfter.z
    );
    const dimAtLevel = Math.pow(2, tileLevel);
    const dimensionsGlobal = Cesium.Cartesian3.fromElements(
      dimensions.x * dimAtLevel,
      dimensions.y * dimAtLevel,
      dimensions.z * dimAtLevel
    );
    const minimumGlobalCoord = Cesium.Cartesian3.ZERO;
    const maximumGlobalCoord = new Cesium.Cartesian3(
      dimensionsGlobal.x - 1,
      dimensionsGlobal.y - 1,
      dimensionsGlobal.z - 1
    );
    let coordGlobal = new Cesium.Cartesian3();
  
    const dataGlobal = this._allVoxelData;
    const dataTile = new Float32Array(
      paddedDimensions.x *
        paddedDimensions.y *
        paddedDimensions.z *
        channelCount
    );
  
    for (let z = 0; z < paddedDimensions.z; z++) {
      const indexZ = z * paddedDimensions.y * paddedDimensions.x;
      for (let y = 0; y < paddedDimensions.y; y++) {
        const indexZY = indexZ + y * paddedDimensions.x;
        for (let x = 0; x < paddedDimensions.x; x++) {
          const indexTile = indexZY + x;
  
          coordGlobal = Cesium.Cartesian3.clamp(
            Cesium.Cartesian3.fromElements(
              tileX * dimensions.x + (x - paddingBefore.x),
              tileY * dimensions.y + (y - paddingBefore.y),
              tileZ * dimensions.z + (z - paddingBefore.z),
              coordGlobal
            ),
            minimumGlobalCoord,
            maximumGlobalCoord,
            coordGlobal
          );
  
          const indexGlobal =
            coordGlobal.z * dimensionsGlobal.y * dimensionsGlobal.x +
            coordGlobal.y * dimensionsGlobal.x +
            coordGlobal.x;
  
          for (let c = 0; c < channelCount; c++) {
            dataTile[indexTile * channelCount + c] =
              dataGlobal[tileLevel][indexGlobal * channelCount + c];
          }
        }
      }
    }
    return Promise.resolve([dataTile]);
  };
  
  function createPrimitive(provider, customShader, modelMatrix) {
    viewer.scene.primitives.removeAll();
  
    const voxelPrimitive = viewer.scene.primitives.add(
      new Cesium.VoxelPrimitive({
        provider: provider,
        customShader: customShader,
        modelMatrix: modelMatrix,
      })
    );
  
    viewer.voxelInspector.viewModel.voxelPrimitive = voxelPrimitive;
    viewer.camera.flyToBoundingSphere(voxelPrimitive.boundingSphere, {
      duration: 0.0,
    });
  
    return voxelPrimitive;
  }
  
  const customShaderColor = new Cesium.CustomShader({
    fragmentShaderText: `void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
    {
        material.diffuse = fsInput.metadata.color.rgb;
        float transparency = 1.0 - fsInput.metadata.color.a;
  
        // To mimic light scattering, use exponential decay
        float thickness = fsInput.voxel.travelDistance * 16.0;
        material.alpha = 1.0 - pow(transparency, thickness);
    }`,
  });
  
  const customShaderWhite = new Cesium.CustomShader({
    fragmentShaderText: `void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
    {
        material.diffuse = vec3(1.0);
        material.alpha = 1.0;
    }`,
  });
  
  const modelMatrix = Cesium.Matrix4.fromScale(
    Cesium.Cartesian3.fromElements(
      Cesium.Ellipsoid.WGS84.maximumRadius,
      Cesium.Ellipsoid.WGS84.maximumRadius,
      Cesium.Ellipsoid.WGS84.maximumRadius
    )
  );
  
  
  const provider = new ProceduralMultiTileVoxelProvider(
    Cesium.VoxelShapeType.ELLIPSOID
  );
  provider.minBounds.z = 0.0;
  provider.maxBounds.z = 1000000.0;
  const primitive = createPrimitive(
    provider,
    customShaderColor,
    modelMatrix
  );
  
  
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (movement) {
    const scene = viewer.scene;
    const camera = scene.camera;
    const mousePosition = movement.position;
    const pickedPrimitive = scene.pick(mousePosition);
    console.log(pickedPrimitive);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  try {
    const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(error);
  }
 // Set initial camera position (New York City)
viewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-74.014632, 40.695342, 1000), // Adjust the height as needed
    orientation: {
      heading: Cesium.Math.toRadians(25),
      pitch: Cesium.Math.toRadians(-30), // Set the initial pitch to 20 degrees
      roll: 0,
    },
  });
  
  // Wait for 4 seconds before transitioning to Paris
  setTimeout(() => {
    // Set camera position to Paris
    viewer.scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-74.014632, 40.695342, 20000000), // Paris coordinates
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90), // Maintain the same pitch
        roll: 0,
      },
      duration: 8, // Transition duration in seconds
    });
  
    // After the transition, start the rotation animation
    setTimeout(() => {
      function animateRotation() {
        const rotationSpeed = Cesium.Math.toRadians(0.1); // Adjust the rotation speed
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotationSpeed);
        requestAnimationFrame(animateRotation);
      }
  
      // Start the animation
      animateRotation();
    }, 8000); // Wait 3 seconds after transitioning to Paris
  }, 4000);
