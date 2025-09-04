import React, { createContext, useState, useEffect } from 'react';
import { Log } from '../utils/logging';

export const URLContext = createContext();

const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
};

export const URLProvider = ({ children }) => {
    const [urls, setUrls] = useState(() => {
        try {
            const localData = localStorage.getItem('urls');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            Log('frontend', 'error', 'context', 'Failed to parse URLs from localStorage');
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('urls', JSON.stringify(urls));
        } catch (error) {
            Log('frontend', 'error', 'context', 'Failed to save URLs to localStorage');
        }
    }, [urls]);

    const addUrls = (newUrls) => {
        const processedUrls = newUrls.map(url => {
            const shortCode = url.shortCode || generateShortCode();
            // Simple validation to prevent duplicates, in a real app this would be more robust
            if (urls.some(u => u.shortCode === shortCode)) {
                Log('frontend', 'warn', 'context', `Shortcode ${shortCode} already exists.`);
                // Handle collision, for now, we'll just generate a new one
                return {
                    ...url,
                    shortUrl: generateShortCode(),
                    createdAt: new Date().toISOString(),
                    expiryDate: new Date(new Date().getTime() + (parseInt(url.validity, 10) || 30) * 60000).toISOString(),
                    clicks: 0,
                    clickDetails: []
                };
            }
            return {
                ...url,
                shortUrl: shortCode,
                createdAt: new Date().toISOString(),
                expiryDate: new Date(new Date().getTime() + (parseInt(url.validity, 10) || 30) * 60000).toISOString(),
                clicks: 0,
                clickDetails: []
            };
        });

        const updatedUrls = [...urls, ...processedUrls];
        setUrls(updatedUrls);
        Log('frontend', 'info', 'context', `${processedUrls.length} new URLs added.`);
        return processedUrls;
    };

    const getUrlByShortCode = (shortCode) => {
        return urls.find(url => url.shortUrl === shortCode);
    };

    const recordClick = (shortCode, source) => {
        const updatedUrls = urls.map(url => {
            if (url.shortUrl === shortCode) {
                const newUrl = {
                    ...url,
                    clicks: url.clicks + 1,
                    clickDetails: [
                        ...url.clickDetails,
                        {
                            timestamp: new Date().toISOString(),
                            source: source,
                            // In a real app, we'd get this from a service
                            location: 'Unknown'
                        }
                    ]
                };
                Log('frontend', 'info', 'context', `Click recorded for ${shortCode}`);
                return newUrl;
            }
            return url;
        });
        setUrls(updatedUrls);
    };


    return (
        <URLContext.Provider value={{ urls, addUrls, getUrlByShortCode, recordClick }}>
            {children}
        </URLContext.Provider>
    );
};
