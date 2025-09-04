import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import Statistics from '../components/Statistics';
import { urlService } from '../services/urlService';
import { ShortenedURL } from '../types';
import { logger } from '../utils/logger';

const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedURL[]>([]);

  useEffect(() => {
    const loadUrls = () => {
      const allUrls = urlService.getUrls();
      setUrls(allUrls);
      logger.debug('Statistics page loaded', { urlCount: allUrls.length });
    };

    loadUrls();
    
    // Set up interval to refresh data periodically
    const interval = setInterval(loadUrls, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <BarChart sx={{ fontSize: 'inherit' }} />
          URL Statistics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive analytics for your shortened URLs
        </Typography>
      </Box>

      <Statistics urls={urls} />
    </Container>
  );
};

export default StatisticsPage;