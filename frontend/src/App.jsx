import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import URLShortenerPage from './pages/URLShortenerPage';
import URLShortenerStatisticsPage from './pages/URLShortenerStatisticsPage';
import NotFoundPage from './pages/NotFoundPage';
import RedirectHandler from './components/RedirectHandler';

function App() {
    return (
        <Router>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<URLShortenerPage />} />
                    <Route path="/stats" element={<URLShortenerStatisticsPage />} />
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/:shortCode" element={<RedirectHandler />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
