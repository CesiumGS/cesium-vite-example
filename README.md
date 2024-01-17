# cesium-vite-example

A minimal recommended setup for an applications using [Cesium](https://cesium.com) with [Vite](https://vitejs.dev/).

## Running this application

- `npm install`
- `npm run dev`

## Requiring Cesium in your application

We recommend [importing named exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) from the Cesium ES module, via the `import` keyword.

### Import named modules from Cesium

```js
import { Color } from "cesium";
var c = Color.fromRandom();
```

### Import Cesium static asset files

```js
import "cesium/Build/Cesium/Widgets/widgets.css";
```

## Cesium sub-packages

CesiumJS requires a few static files to be hosted on your server, like web workers and SVG icons. This example is already set up to copy these directories if you install the whole `cesium` package.

```js
viteStaticCopy({
  targets: [
    { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
    { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
    { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
    { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
  ],
}),
```

However if you only install `@cesium/engine` then you should change the paths in [`vite.config.js`](./vite.config.js) to the ones below:

```js
viteStaticCopy({
  targets: [
    { src: 'node_modules/@cesium/engine/Build/Workers', dest: cesiumBaseUrl },
    { src: 'node_modules/@cesium/engine/Build/ThirdParty', dest: cesiumBaseUrl },
    { src: 'node_modules/@cesium/engine/Source/Assets', dest: cesiumBaseUrl },
  ],
}),
```

## Contributions

Pull requests are appreciated. Please use the same [Contributor License Agreement (CLA)](https://github.com/CesiumGS/cesium/blob/master/CONTRIBUTING.md) used for [Cesium](https://cesium.com/).

---

Developed by the Cesium team.
