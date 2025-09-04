import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  BarChart,
  Link as LinkIcon,
  Mouse,
  TrendingUp
} from '@mui/icons-material';
import { ShortenedURL, ClickData } from '../types';
import { urlService } from '../services/urlService';

interface Props {
  urls: ShortenedURL[];
}

const Statistics: React.FC<Props> = ({ urls }) => {
  const allClicks = urlService.getAllClicks();
  // Filter out clicks that don't have corresponding URLs (orphaned clicks)
  const validClicks = allClicks.filter(click => urls.some(url => url.id === click.shortUrlId));
  const totalClicks = validClicks.length;
  const totalUrls = urls.length;
  const activeUrls = urls.filter(url => url.isActive && new Date() < url.expiryDate).length;
  
  // Calculate average clicks per URL (only for URLs that have clicks)
  const urlsWithClicks = urls.filter(url => url.clickCount > 0);
  const avgClicksPerUrl = urlsWithClicks.length > 0 
    ? Math.round(totalClicks / urlsWithClicks.length) 
    : totalClicks; // If only one URL exists, show total clicks

  const getClicksForUrl = (urlId: string): ClickData[] => {
    return urlService.getClicksForUrl(urlId);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getUrlStatus = (url: ShortenedURL) => {
    const now = new Date();
    if (!url.isActive) return { label: 'Deactivated', color: 'default' as const };
    if (now > url.expiryDate) return { label: 'Expired', color: 'error' as const };
    return { label: 'Active', color: 'success' as const };
  };

  if (urls.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No statistics available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create some shortened URLs to see analytics and statistics
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon color="primary" />
                <Typography color="text.secondary" gutterBottom>
                  Total URLs
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {totalUrls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="success" />
                <Typography color="text.secondary" gutterBottom>
                  Active URLs
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {activeUrls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mouse color="info" />
                <Typography color="text.secondary" gutterBottom>
                  Total Clicks
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {totalClicks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart color="warning" />
                <Typography color="text.secondary" gutterBottom>
                  Avg. Clicks
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {avgClicksPerUrl}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Statistics Table */}
      <Paper elevation={3}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart />
            Detailed Statistics
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Clicks</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Last Click</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => {
                const clicks = getClicksForUrl(url.id);
                const lastClick = clicks.length > 0 ? clicks[clicks.length - 1] : null;
                const status = getUrlStatus(url);
                
                return (
                  <TableRow key={url.id} hover>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        component="a"
                        href={`${window.location.origin}/${url.shortCode}`}
                        target="_blank"
                        sx={{ 
                          color: 'primary.main',
                          textDecoration: 'none',
                          fontFamily: 'monospace',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        /{url.shortCode}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={url.originalUrl}
                      >
                        {url.originalUrl}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Mouse fontSize="small" color="action" />
                        {url.clickCount}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(url.createdAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={new Date() > url.expiryDate ? 'error' : 'text.secondary'}
                      >
                        {formatDate(url.expiryDate)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {lastClick ? formatDate(lastClick.timestamp) : 'Never'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Clicks */}
      {validClicks.length > 0 && (
        <Paper elevation={3} sx={{ mt: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Mouse />
              Recent Clicks
            </Typography>
          </Box>
          
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {validClicks.slice(-10).reverse().map((click, index) => {
              const url = urls.find(u => u.id === click.shortUrlId);
              
              return (
                <React.Fragment key={click.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="body2" 
                            fontFamily="monospace"
                            component="span"
                            sx={{ 
                              color: url ? 'primary.main' : 'text.disabled',
                              cursor: url ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                              if (url) {
                                window.open(`${window.location.origin}/${url.shortCode}`, '_blank');
                              }
                            }}
                          >
                            /{url?.shortCode || 'unknown'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {url ? `${url.clickCount} clicks` : 'clicks'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(click.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      secondary={url ? (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          URL data not found
                        </Typography>
                      )}
                    />
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default Statistics;