import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { URLProvider } from './context/URLContext';

const theme = createTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <URLProvider>
                <App />
            </URLProvider>
        </ThemeProvider>
    </React.StrictMode>
);
