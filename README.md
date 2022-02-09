# ssi-mini-webpack-plugin
A webpack plugin to support ssi.

## Install
```bash
npm install ssi-mini-webpack-plugin --save-dev
```

## Usage
```javascript
// webpack.config.js

const SSIMiniWebpackplugin = require('ssi-mini-webpack-plugin');

module.exports = {
  plugins: [
    new SSIMiniWebpackplugin({
      test: /\.shtml/,
      remote: 'https://wqs.jd.com',
      minify: true,
    }),
  ],
}
```

## Options
* test: `RegExp` | `Function`. To detect which file to 
* minify: `boolean`. Default `false`. Minify or not.
* remote: `string`. The remote url to fetch include content. e.g., `https://example.com/`.
* local: `string`. Default `/`. The local absolute dir to store html segements. Option `remote` has priority.
