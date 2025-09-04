import React, { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { URLContext } from '../context/URLContext';
import { Log } from '../utils/logging';
import NotFoundPage from '../pages/NotFoundPage';

const RedirectHandler = () => {
    const { shortCode } = useParams();
    const navigate = useNavigate();
    const { getUrlByShortCode, recordClick } = useContext(URLContext);

    useEffect(() => {
        Log('frontend', 'info', 'component', `Attempting to redirect for shortcode: ${shortCode}`);
        const urlData = getUrlByShortCode(shortCode);

        if (urlData) {
            const now = new Date();
            const expiry = new Date(urlData.expiryDate);

            if (now > expiry) {
                Log('frontend', 'warn', 'component', `Attempted to access expired link: ${shortCode}`);
                navigate('/404', { replace: true });
            } else {
                recordClick(shortCode, document.referrer);
                window.location.href = urlData.longUrl;
            }
        } else {
            Log('frontend', 'warn', 'component', `Shortcode not found: ${shortCode}`);
            navigate('/404', { replace: true });
        }
    }, [shortCode, getUrlByShortCode, recordClick, navigate]);

    // This component doesn't render anything itself, it just handles logic.
    // It could render a loading spinner, but for a quick redirect, it's not essential.
    // The final navigation to a 404 is handled in the effect, so we can render the not found page here as a fallback.
    return <NotFoundPage />;
};

export default RedirectHandler;
