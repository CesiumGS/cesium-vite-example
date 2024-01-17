# cesium-vite-example

A minimal recommended setup for an applications using [Cesium](https://cesium.com) with [Vite](https://vitejs.dev/).

If you are using Webpack instead of Vite check out our [`cesium-webpack-example`](https://github.com/CesiumGS/cesium-webpack-example) repo.

## Vue/React/Svelte/etc support

This example was created to be the lowest common denominator in the Vite ecosystem. The same configuration has been tested with other UI frameworks in Vite with a small modification of adding the relavent plugin and should work the same regardless. If you run into framework specific problems please [open an issue](https://github.com/CesiumGS/cesium-vite-example/issues/new) and we can try and address it.

## Running this application

```sh
npm install
npm run dev
# for the built version
npm run build
npm run preview
```

Navigate to `localhost:5174`. For the built version navigate to `localhost:4174`

## Available scripts

- `npm run eslint`, `npm run prettier`, `npm run prettier-check` - Lint this project to maintain code style
- `npm run dev` - Starts the Vite development server server at `localhost:5174`
- `npm run build` - Runs the Vite build
- `npm run preview` - Starts a local preview of the production build using [`vite preview`](https://vitejs.dev/guide/cli.html#vite-preview)

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

Also instead of importing this css file in your project:

```js
import "cesium/Build/Cesium/Widgets/widgets.css";
```

you will need to update the import to:

```js
import "@cesium/engine/Source/Widget/CesiumWidget.css";
```

## Contributions

Pull requests are appreciated. Please use the same [Contributor License Agreement (CLA)](https://github.com/CesiumGS/cesium/blob/master/CONTRIBUTING.md) used for [Cesium](https://cesium.com/).

---

Developed by the Cesium team.
