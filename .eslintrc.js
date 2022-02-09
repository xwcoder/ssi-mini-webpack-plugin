module.exports = {
  extends: [
    'airbnb-base',
    'plugin:sonarjs/recommended',
  ],
  plugins: ['sonarjs'],
  env: {
    node: true,
  },
  rules: {
    complexity: ['error', { max: 10 }],
  },
};
