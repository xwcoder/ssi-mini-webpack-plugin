module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '90',
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
};
