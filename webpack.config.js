const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

module.exports = (env) => {
  // Doğru ortam değişkenlerini yükle
  const currentEnv = env.production ? 'production' : 'development';
  const envPath = `.env.${currentEnv}`;

  // Varsayılan .env dosyasını yükle
  const defaultEnv = dotenv.config({ path: '.env' }).parsed || {};
  
  // Ortam spesifik .env dosyasını yükle
  const envConfig = dotenv.config({ path: envPath }).parsed || {};
  
  // İki env dosyasını birleştir, ortam spesifik dosya öncelikli
  const envVars = { ...defaultEnv, ...envConfig };

  // Create a formatted env to pass into DefinePlugin
  const stringifiedEnv = {
    'process.env': Object.keys(envVars).reduce((env, key) => {
      env[key] = JSON.stringify(envVars[key]);
      return env;
    }, {})
  };

  return {
    plugins: [
      new webpack.DefinePlugin(stringifiedEnv)
    ],
    devServer: {
      allowedHosts: ['localhost', '.localhost', '127.0.0.1'],
      host: envVars.HOST || 'localhost',
      port: envVars.PORT || 3000
    },
    output: {
      publicPath: '/',
      filename: 'codeyzer-p2p.bundle.js'
    }
  };
}; 