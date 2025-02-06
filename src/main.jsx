import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@shopify/polaris/build/esm/styles.css';
import App from './App.jsx'
import enTranslations from '@shopify/polaris/locales/en.json';
import {AppProvider, Page, LegacyCard, Button} from '@shopify/polaris';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider i18n={enTranslations}>
    <Page title="Example app">
      <LegacyCard sectioned>
        <Button onClick={() => alert('Button clicked!')}>Example button</Button>
      </LegacyCard>
    </Page>
  </AppProvider>
  </StrictMode>,
)
