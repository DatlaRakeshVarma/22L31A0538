import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import URLShortenerForm from '../components/URLShortenerForm';
import URLList from '../components/URLList';
import { urlService } from '../services/urlService';
import { ShortenedURL } from '../types';
import { logger } from '../utils/logger';

const URLShortenerPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedURL[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadUrls = () => {
    const allUrls = urlService.getUrls();
    setUrls(allUrls);
    logger.debug('URLs loaded for display', { count: allUrls.length });
  };

  const handleUrlChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadUrls();
    
    // Cleanup expired URLs on page load
    const cleanedCount = urlService.cleanupExpiredUrls();
    if (cleanedCount > 0) {
      loadUrls(); // Reload if any URLs were cleaned up
    }
  }, [refreshTrigger]);

  const activeUrls = urls.filter(url => url.isActive && new Date() < url.expiryDate);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          URL Shortener
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Transform long URLs into short, manageable links with detailed analytics
        </Typography>
      </Box>

      {activeUrls.length >= 5 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have reached the maximum of 5 concurrent active URLs. Wait for some to expire or deactivate unused ones to create new short URLs.
        </Alert>
      )}

      <URLShortenerForm 
        onUrlShortened={handleUrlChange} 
        activeUrlCount={activeUrls.length}
      />
      
      <URLList 
        urls={urls} 
        onUrlUpdated={handleUrlChange}
      />
    </Container>
  );
};

export default URLShortenerPage;