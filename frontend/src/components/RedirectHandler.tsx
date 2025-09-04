import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Error, Home } from '@mui/icons-material';
import { urlService } from '../services/urlService';
import { logger } from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [redirecting, setRedirecting] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      if (!shortCode) {
        setError('Invalid short code');
        setLoading(false);
        return;
      }

      try {
        logger.info('Redirect attempt started', { shortCode });
        
        const url = urlService.getUrlByShortCode(shortCode);
        
        if (!url) {
          setError('Short URL not found');
          logger.warn('Short URL not found', { shortCode });
          setLoading(false);
          return;
        }

        const now = new Date();
        if (now > url.expiryDate) {
          setError('This short URL has expired');
          logger.warn('Expired URL accessed', { shortCode, expiryDate: url.expiryDate });
          setLoading(false);
          return;
        }

        if (!url.isActive) {
          setError('This short URL has been deactivated');
          logger.warn('Deactivated URL accessed', { shortCode });
          setLoading(false);
          return;
        }

        // Record the click
        const clickData = urlService.recordClick(
          shortCode,
          navigator.userAgent,
          document.referrer || 'direct'
        );

        if (clickData) {
          setRedirecting(true);
          logger.info('Successful redirect', { 
            shortCode, 
            originalUrl: url.originalUrl,
            clickId: clickData.id 
          });
          
          // Small delay to show redirect message
          setTimeout(() => {
            window.location.href = url.originalUrl;
          }, 1500);
        } else {
          setError('Failed to process redirect');
          logger.error('Failed to record click during redirect', { shortCode });
        }
      } catch (error) {
        const errorMessage = 'An error occurred while processing the redirect';
        setError(errorMessage);
        logger.error('Redirect processing error', error);
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50'
      }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Processing your request...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we validate the short URL
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (redirecting) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50'
      }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} color="success" />
          <Typography variant="h6" gutterBottom color="success.main">
            Redirecting...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will be redirected to the original URL shortly
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'grey.50',
      p: 2
    }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
        <Error color="error" sx={{ fontSize: 64, mb: 2 }} />
        
        <Typography variant="h5" gutterBottom color="error">
          Oops! Something went wrong
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The short URL "/{shortCode}" could not be processed. This might be because:
        </Typography>
        
        <Box component="ul" sx={{ textAlign: 'left', pl: 2, mb: 3 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            The URL has expired
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            The URL has been deactivated
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            The short code doesn't exist
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Home />}
          href="/"
          size="large"
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default RedirectHandler;