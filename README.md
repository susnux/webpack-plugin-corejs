<!-- 
SPDX-FileCopyrightText: 2023 Ferdinand Thiessen <rpm@fthiessen.de>
SPDX-License-Identifier: EUPL-1.2
--->
[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/susnux/webpack-plugin-corejs)](https://github.com/susnux/webpack-plugin-corejs/releases)
[![GitHub Workflow Status (main branch)](https://img.shields.io/github/actions/workflow/status/susnux/webpack-plugin-corejs/node.yml?branch=main)](https://github.com/susnux/webpack-plugin-corejs/actions/workflows/node.yml)

# webpack-plugin-corejs
A webpack plugin for injecting [core-js](https://github.com/zloirock/core-js) polyfills based
on your browserslist configuration.

This plugin is essentially a wrapper for core-js-builder for webpack.

One usecase is that you are not using babel, but [esbuild](https://github.com/privatenumber/esbuild-loader)
for transpiling, e.g. using the [ESBuildMinifyPlugin](https://github.com/privatenumber/esbuild-loader#js-minification-eg-terser)
with your supported browsers is much faster then using Babel, but it only transpiles the syntax and does not add any polyfills.
So you would need to add e.g. *core-js* polyfills manually... or... use this plugin.

### Compatibility
This version should work with *webpack 4* as well as with *webpack 5*.

## Getting started
### 🚀 Installation

```shell
npm i -D webpack-plugin-corejs
```

### 🔧 Configuration
In your `webpack.config.js`:
```js
const CoreJSPlugin = require('webpack-plugin-corejs')

module.exports = {
  //...
  plugins: [
    new CoreJSPlugin({
        // Options
    }),
    // ...
  ]
  // ...
}
```

Or in your `webpack.config.mjs`:
```js
import { CoreJSPlugin } from 'webpack-plugin-corejs'

export default {
  //...
  plugins: [
    new CoreJSPlugin({
        // Options
    }),
    // ...
  ]
  // ...
}
```

### 🛠️ Options
All options are optionally, if no options are given the default is to use `{ modules: 'core-js/es' }`.

You can omit setting `targets` in this case browserslist is used (`package.json` or `.browserslistrc`).

```ts
{
  /** CoreJS modules to use, defaults to 'core-js/es' */
  modules?: string | readonly string[] | readonly RegExp[],
  /** CoreJS modules to exclude */
  exclude?: string | readonly string[] | readonly RegExp[],
  /** Overide browserslist targets */
  targets?: string | readonly string[] | Record<string, string | readonly string[]>
  /** Add comment which modules are used within bundle */
  summary?: {
    size: boolean
    modules: boolean
  }
}
```

## Changelog
See [CHANGELOG](CHANGELOG.md)

## License
[EUPL-1.2](LICENSES/EUPL-1.2.txt)