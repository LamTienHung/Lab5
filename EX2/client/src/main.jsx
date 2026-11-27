import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppProvider.jsx';
import App from './App.jsx';
import './styles/ChatWorkspace.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);