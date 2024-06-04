module.exports = {
  roots: ['<rootDir>/src/'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t)s$': 'ts-jest',
  },
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/config/setupAfterEnv.ts'],
  moduleDirectories: ['<rootDir>/node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/empty.js',
    '\\.(svg)$': 'identity-obj-proxy',
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^uuid$': require.resolve('uuid'),
    // '^react$': '<rootDir>/node_modules/react',
    // '^react-dom$': '<rootDir>/node_modules/react-dom',
  },

  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@redhat-cloud-services|@openshift|lodash-es|uuid|@patternfly/react-icons)',
  ],
};
