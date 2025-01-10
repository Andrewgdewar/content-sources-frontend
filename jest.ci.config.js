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
    // Below replaces imports for speed
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/empty.js',
    '\\.(css|scss|svg)$': 'identity-obj-proxy',
    '^uuid$': require.resolve('uuid'),
  },
  transformIgnorePatterns: [
    // Ignores imports of icons and other unneeded modules
    '<rootDir>/node_modules/(?!@redhat-cloud-services|@openshift|lodash-es|uuid|@patternfly/react-icons)',
  ],
};
