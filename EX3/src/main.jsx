import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installDevMock } from './agent/modelContext.js';
import { AppProvider } from './context/AppProvider.jsx';
import App from './App.jsx';
import './styles/ChatWorkspace.css';

// Bật mock WebMCP khi trình duyệt chưa hỗ trợ (chỉ ở chế độ dev)
installDevMock();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);