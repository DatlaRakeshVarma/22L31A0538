import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Link as LinkIcon, BarChart, Home } from '@mui/icons-material';
import { useLocation, Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        <LinkIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          URL Shortener
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<Home />}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ 
              color: 'white',
              borderColor: location.pathname === '/' ? 'white' : 'transparent'
            }}
          >
            Shortener
          </Button>
          
          <Button
            color="inherit"
            component={Link}
            to="/statistics"
            startIcon={<BarChart />}
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            sx={{ 
              color: 'white',
              borderColor: location.pathname === '/statistics' ? 'white' : 'transparent'
            }}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;