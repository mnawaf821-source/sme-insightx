import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './config/query-client';
import { ThemeProvider } from './lib/theme';
import { applyDirection } from './lib/i18n';
import App from './App';
import './lib/i18n';
import './index.css';

// Apply initial direction
applyDirection(localStorage.getItem('sme-insightx-lang') || 'en');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
