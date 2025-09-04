import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  ContentCopy,
  OpenInNew,
  Delete,
  AccessTime,
  BarChart,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { ShortenedURL } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../utils/logger';

interface Props {
  urls: ShortenedURL[];
  onUrlUpdated: () => void;
}

const URLList: React.FC<Props> = ({ urls, onUrlUpdated }) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard', { url: text });
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
    }
  };

  const handleDeactivate = (shortCode: string) => {
    urlService.deactivateUrl(shortCode);
    onUrlUpdated();
    logger.info('URL deactivated by user', { shortCode });
  };

  const isExpired = (url: ShortenedURL) => {
    return new Date() > url.expiryDate;
  };

  const formatTimeRemaining = (expiryDate: Date) => {
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (urls.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <BarChart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No URLs shortened yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first shortened URL above to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ mt: 3 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h3">
          Your Shortened URLs
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {urls.map((url, index) => {
          const expired = isExpired(url);
          const shortUrl = `${window.location.origin}/${url.shortCode}`;
          
          return (
            <React.Fragment key={url.id}>
              {index > 0 && <Divider />}
              <ListItem sx={{ px: 3, py: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        component="a"
                        href={shortUrl}
                        target="_blank"
                        sx={{ 
                          textDecoration: 'none',
                          color: 'primary.main',
                          fontWeight: 'medium',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {shortUrl}
                      </Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(shortUrl)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: 'break-all' }}>
                        → {url.originalUrl}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          icon={expired ? <Error /> : <CheckCircle />}
                          label={expired ? 'Expired' : `${formatTimeRemaining(url.expiryDate)} left`}
                          color={expired ? 'error' : 'success'}
                          size="small"
                        />
                        
                        <Chip
                          icon={<BarChart />}
                          label={`${url.clickCount} clicks`}
                          variant="outlined"
                          size="small"
                        />
                        
                        <Chip
                          icon={<AccessTime />}
                          label={`Created ${url.createdAt.toLocaleString()}`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Open original URL">
                      <IconButton 
                        href={url.originalUrl} 
                        target="_blank"
                        size="small"
                      >
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                    
                    {!expired && url.isActive && (
                      <Tooltip title="Deactivate URL">
                        <IconButton 
                          onClick={() => handleDeactivate(url.shortCode)}
                          size="small"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default URLList;