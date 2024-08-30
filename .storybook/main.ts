import type { StorybookConfig } from '@storybook/react-webpack5';
const path = require('path');

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/stories/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    {
      name: '@storybook/addon-essentials',
      options: {
        actions: false, // This just turns off the "actions" tab, as we aren't using it
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  swc: () => ({
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }),
  webpackFinal: async (config) => {
    if (config.resolve)
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        path.resolve(__dirname, '../src'),
      ];

    return config;
  },
};

export default config;
