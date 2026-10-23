import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import AppErrorBoundary from './components/AppErrorBoundary';
import PortalToasts from './components/PortalToasts';

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <AuthProvider>
      <App />
      <PortalToasts />
    </AuthProvider>
  </AppErrorBoundary>
);
