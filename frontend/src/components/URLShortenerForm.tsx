import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { Link as LinkIcon, Timer, Code } from '@mui/icons-material';
import { URLFormData, ValidationError } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../utils/logger';

interface Props {
  onUrlShortened: () => void;
  activeUrlCount: number;
}

const URLShortenerForm: React.FC<Props> = ({ onUrlShortened, activeUrlCount }) => {
  const [formData, setFormData] = useState<URLFormData>({
    originalUrl: '',
    validityMinutes: 30,
    customShortCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState<string>('');

  const canAddMore = activeUrlCount < 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAddMore) {
      setErrors([{ field: 'general', message: 'Maximum of 5 concurrent URLs allowed' }]);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess('');

    try {
      logger.info('Form submission started', formData);
      
      const validation = urlService.validateUrl(formData);
      if (validation.length > 0) {
        setErrors(validation);
        logger.warn('Form validation failed', { errors: validation });
        return;
      }

      const shortenedUrl = urlService.createShortUrl(formData);
      
      setSuccess(`Short URL created: ${window.location.origin}/${shortenedUrl.shortCode}`);
      setFormData({ originalUrl: '', validityMinutes: 30, customShortCode: '' });
      onUrlShortened();
      
      logger.info('URL shortened successfully', { shortCode: shortenedUrl.shortCode });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create short URL';
      setErrors([{ field: 'general', message: errorMessage }]);
      logger.error('Error creating short URL', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon color="primary" />
        Shorten URL ({activeUrlCount}/5)
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Original URL"
          value={formData.originalUrl}
          onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
          error={!!getFieldError('originalUrl')}
          helperText={getFieldError('originalUrl')}
          placeholder="https://example.com/very/long/url"
          disabled={loading || !canAddMore}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel htmlFor="validity-input">Validity Period</InputLabel>
            <OutlinedInput
              id="validity-input"
              type="number"
              value={formData.validityMinutes}
              onChange={(e) => setFormData({ ...formData, validityMinutes: parseInt(e.target.value) || 30 })}
              error={!!getFieldError('validityMinutes')}
              disabled={loading || !canAddMore}
              startAdornment={<InputAdornment position="start"><Timer /></InputAdornment>}
              endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
              label="Validity Period"
            />
            {getFieldError('validityMinutes') && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {getFieldError('validityMinutes')}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Custom Shortcode (optional)"
            value={formData.customShortCode}
            onChange={(e) => setFormData({ ...formData, customShortCode: e.target.value })}
            error={!!getFieldError('customShortCode')}
            helperText={getFieldError('customShortCode')}
            placeholder="my-link"
            disabled={loading || !canAddMore}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Code />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {errors.find(error => error.field === 'general') && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getFieldError('general')}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, wordBreak: 'break-all' }}>
            {success}
          </Alert>
        )}

        {!canAddMore && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have reached the maximum of 5 concurrent shortened URLs. Please wait for some to expire or deactivate unused ones.
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || !canAddMore}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Creating Short URL...
            </Box>
          ) : (
            'Shorten URL'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default URLShortenerForm;