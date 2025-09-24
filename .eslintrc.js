module.exports = {
  root: true,
  extends: ['@react-native'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@react-native/babel-preset'],
    },
  },
  rules: {
    // Disable some strict rules that might cause issues
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.cxx/',
    'build/',
  ],
};