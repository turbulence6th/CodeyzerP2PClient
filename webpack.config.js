module.exports = {
  devServer: {
    allowedHosts: ['localhost', '.localhost', '127.0.0.1'],
    host: 'localhost',
    port: 3000
  },
  output: {
    publicPath: '/',
    filename: 'codeyzer-p2p.bundle.js'
  }
}; 