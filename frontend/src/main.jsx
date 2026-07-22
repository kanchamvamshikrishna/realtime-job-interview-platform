import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { store } from './app/store.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <SocketProvider>
            <App />
          </SocketProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
