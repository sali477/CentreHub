import './i18n/index.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { store } from './store/store.js';
import { setTheme } from './store/slices/uiSlice';
import { initTheme } from './hooks/useTheme';
import { getGoogleClientId, isGoogleAuthConfigured } from './utils/googleAuth';
import './index.css';

if (import.meta.env.DEV) {
  console.log('[CentreHub] main.jsx — initializing app');
}

store.dispatch(setTheme(initTheme()));

const googleClientId = getGoogleClientId();
const googleAuthEnabled = isGoogleAuthConfigured();

if (!googleAuthEnabled && import.meta.env.DEV) {
  console.warn(
    '[CentreHub] Google Sign-In disabled: set VITE_GOOGLE_CLIENT_ID in frontend/.env (see frontend/.env.example).'
  );
}

const app = (
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {googleAuthEnabled ? (
      <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
