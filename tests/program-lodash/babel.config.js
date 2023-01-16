module.exports = {
  presets: [],
  plugins: [
    [
      require('./babelplugin/lodash-import'),
      {
        libraryName: 'lodash'
      }
    ]
  ]
}