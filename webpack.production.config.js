'use strict';

const webpack = require('webpack');

const config = require('./webpack.config');

const plugins = [];

plugins.push(
  new webpack.DefinePlugin({
    'process.env': { NODE_ENV: '"production"' }
  }),
  new webpack.NoEmitOnErrorsPlugin(),
);

config.plugins = plugins;
config.mode = 'production';
delete config.devtool;
module.exports = config;
