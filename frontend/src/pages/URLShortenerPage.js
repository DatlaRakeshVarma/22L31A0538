import React, { useState } from 'react';
import URLShortenerForm from '../components/URLShortenerForm';
import URLList from '../components/URLList';
import { Container, Typography } from '@mui/material';

const URLShortenerPage = () => {
    const [shortenedUrls, setShortenedUrls] = useState([]);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                URL Shortener
            </Typography>
            <URLShortenerForm setShortenedUrls={setShortenedUrls} />
            <URLList urls={shortenedUrls} />
        </Container>
    );
};

export default URLShortenerPage;
