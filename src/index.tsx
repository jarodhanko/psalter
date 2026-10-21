import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { PwaUpdatePrompt } from './features/pwa/PwaUpdatePrompt';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
    <PwaUpdatePrompt />
  </React.StrictMode>
);
