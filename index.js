const path = require('path');
const { readFile } = require('fs/promises');
const fetch = require('node-fetch');
const { minify } = require('html-minifier-terser');

class SSIMiniWebpackplugin {
  constructor(options = {}) {
    this.options = {
      local: '/',
      test: /\.html/,
      minify: false,
      cache: true,
      ...options,
    };

    this.cache = {};
  }

  apply(compiler) {
    const { webpack } = compiler;
    const { RawSource } = webpack.sources;
    const pluginName = SSIMiniWebpackplugin.name;
    const { test } = this.options;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise({
        name: pluginName,
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
      }, async (asserts) => {
        const files = Object.keys(asserts).filter((file) => {
          // TODO 暂时只支持处理RawSource
          if (!(asserts[file] instanceof RawSource)) {
            return false;
          }

          if (test instanceof RegExp) {
            return test.test(file);
          }

          if (typeof test === 'function') {
            return test(file) === true;
          }

          return false;
        });

        return Promise.all(files.map((file) => this.processFile(compiler, asserts, file)));
      });
    });
  }

  async processFile(compiler, asserts, fileName) {
    const { webpack } = compiler;
    const { RawSource } = webpack.sources;

    let content = await this.combine(asserts[fileName].source());

    if (this.options.minify) {
      content = await minify(content, {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      });
    }

    // eslint-disable-next-line no-param-reassign
    asserts[fileName] = new RawSource(content);
  }

  async combine(content) {
    const reg = /<!--#\s*include\s+(?:file|virtual)=(['"])([^\r\n\s]+?)\1\s*-->/g;
    const includes = content.match(reg);

    if (!includes) {
      return content;
    }

    const pathnames = includes.map((v) => {
      reg.lastIndex = 0;
      return reg.exec(v)[2];
    });

    const segments = await Promise.all(pathnames.map(async (v) => this.getSegment(v)));

    includes.forEach((include, index) => {
      // eslint-disable-next-line no-param-reassign
      content = content.replace(include, segments[index]);
    });

    return content;
  }

  async getSegment(pathname) {
    const {
      local,
      remote,
      cache,
    } = this.options;

    let content = '';

    if (cache && this.cache[pathname]) {
      content = this.cache[pathname];
    } else if (remote) {
      const rsp = await fetch(`${remote}${pathname}`);
      content = await rsp.text();
    } else {
      content = await readFile(path.resolve(`${local}${pathname}`), { encoding: 'utf-8' });
    }

    content = this.combine(content);
    this.cache[pathname] = content;

    return content;
  }
}

module.exports = SSIMiniWebpackplugin;
