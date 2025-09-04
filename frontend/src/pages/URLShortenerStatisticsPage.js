import React, { useContext } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Box } from '@mui/material';
import { URLContext } from '../context/URLContext';

const URLShortenerStatisticsPage = () => {
    const { urls } = useContext(URLContext);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                URL Shortener Statistics
            </Typography>
            {urls.length === 0 ? (
                <Typography>No shortened URLs yet.</Typography>
            ) : (
                <List>
                    {urls.map((url, index) => (
                        <Paper key={index} sx={{ mb: 2, p: 2 }}>
                            <ListItem>
                                <ListItemText
                                    primary={`Short URL: ${window.location.origin}/${url.shortUrl}`}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2">
                                                Original: {url.longUrl}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant="body2">
                                                Created: {new Date(url.createdAt).toLocaleString()} | Expires: {new Date(url.expiryDate).toLocaleString()}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant="body2">
                                                Total Clicks: {url.clicks}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                            {url.clickDetails.length > 0 && (
                                <Box sx={{ pl: 4 }}>
                                    <Typography variant="subtitle2">Click Details:</Typography>
                                    <List dense>
                                        {url.clickDetails.map((click, i) => (
                                            <ListItem key={i}>
                                                <ListItemText
                                                    primary={`Clicked at: ${new Date(click.timestamp).toLocaleString()}`}
                                                    secondary={`Source: ${click.source} | Location: ${click.location}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Paper>
                    ))}
                </List>
            )}
        </Container>
    );
};

export default URLShortenerStatisticsPage;
