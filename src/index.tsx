import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './index.css';
import App from './App';

// Cross-Origin Resource Sharing (CORS) için
// Tarayıcılar genellikle farklı kökenlere yapılan istekleri güvenlik nedenleriyle kısıtlar
// Backend'imiz sadece belirli kökenlere izin veriyor, bu nedenle React uygulamasının doğrudan bağlanmasında sorun yaşanabilir

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // React.StrictMode'u kaldırdık çünkü bu mod geliştirme sırasında componentleri iki kez render eder
  // ve bu da WebSocket bağlantımız için sorun oluşturabilir
  <Provider store={store}>
    <App />
  </Provider>
); 