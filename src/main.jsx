import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@shopify/polaris/build/esm/styles.css';
import App from './App.jsx';
import esTranslations from '@shopify/polaris/locales/es.json';
import { AppProvider, Frame } from '@shopify/polaris';
import { ToastProvider } from './components/Toast.jsx';

createRoot(document.getElementById('root')).render(
  <AppProvider i18n={esTranslations}>
    <Frame>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Frame>
  </AppProvider>
  ,
)
