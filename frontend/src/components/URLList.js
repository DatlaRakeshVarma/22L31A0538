import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

const URLList = ({ urls }) => {
    if (!urls || urls.length === 0) {
        return null;
    }

    return (
        <Paper sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ p: 2 }}>
                Shortened URLs
            </Typography>
            <List>
                {urls.map((url, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`Original: ${url.longUrl}`}
                            secondary={`Shortened: ${window.location.origin}/${url.shortUrl} | Expires: ${new Date(url.expiryDate).toLocaleString()}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default URLList;
