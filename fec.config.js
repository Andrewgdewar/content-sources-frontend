/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { dependencies, insights } = require('./package.json');

const moduleName = insights.appname.replace(/-(\w)/g, (_, match) => match.toUpperCase());
const srcDir = path.resolve(__dirname, './src');

module.exports = {
  appName: moduleName,
  appUrl: '/insights/content/repositories',
  useProxy: true,
  moduleFederation: {
    moduleName,
    exposes: {
      './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
    },
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: dependencies['react-router-dom'],
          requiredVersion: '>=6.0.0 <7.0.0',
        },
      },
      {
        '@unleash/proxy-client-react': {
          version: dependencies['@unleash/proxy-client-react'],
          singleton: true,
        },
      },
    ],
  },
  /**
   * Add additional webpack plugins
   */
  //   plugins: [...(process.env.VERBOSE ? [new WatchRunPlugin()] : []), new webpack.ProgressPlugin()],
  resolve: {
    modules: [srcDir, path.resolve(__dirname, './node_modules')],
  },
  routes: {
    ...(process.env.BACKEND_PORT && {
      '/api/content-sources/': {
        host: `http://localhost:${process.env.BACKEND_PORT}`,
      },
    }),
  },
};
