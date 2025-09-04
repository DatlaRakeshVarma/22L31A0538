import React, { useState, useContext } from 'react';
import { Button, TextField, Box, IconButton, Alert } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { Log } from '../utils/logging';
import { URLContext } from '../context/URLContext';

const URLShortenerForm = ({ setShortenedUrls }) => {
    const [urls, setUrls] = useState([{ longUrl: '', shortCode: '', validity: '' }]);
    const [error, setError] = useState('');
    const { addUrls } = useContext(URLContext);

    const handleChange = (index, event) => {
        const values = [...urls];
        values[index][event.target.name] = event.target.value;
        setUrls(values);
    };

    const handleAddFields = () => {
        if (urls.length < 5) {
            setUrls([...urls, { longUrl: '', shortCode: '', validity: '' }]);
        }
    };

    const handleRemoveFields = (index) => {
        const values = [...urls];
        values.splice(index, 1);
        setUrls(values);
    };

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setShortenedUrls([]);

        for (const url of urls) {
            if (!validateUrl(url.longUrl)) {
                setError(`Invalid URL: ${url.longUrl}`);
                Log('frontend', 'error', 'component', `Invalid URL provided: ${url.longUrl}`);
                return;
            }
            if (url.validity && (isNaN(parseInt(url.validity, 10)) || parseInt(url.validity, 10) <= 0)) {
                setError(`Invalid validity period for ${url.longUrl}. Must be a positive number.`);
                Log('frontend', 'error', 'component', `Invalid validity period: ${url.validity}`);
                return;
            }
        }

        Log('frontend', 'info', 'component', 'Shorten URL form submitted');
        const newUrls = addUrls(urls);
        setShortenedUrls(newUrls);
        setUrls([{ longUrl: '', shortCode: '', validity: '' }]);
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {urls.map((url, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                        name="longUrl"
                        label="Original Long URL"
                        variant="outlined"
                        value={url.longUrl}
                        onChange={(event) => handleChange(index, event)}
                        required
                        sx={{ mr: 2, flexGrow: 1 }}
                    />
                    <TextField
                        name="shortCode"
                        label="Optional Preferred Shortcode"
                        variant="outlined"
                        value={url.shortCode}
                        onChange={(event) => handleChange(index, event)}
                        sx={{ mr: 2 }}
                    />
                    <TextField
                        name="validity"
                        label="Optional Validity (minutes)"
                        variant="outlined"
                        type="number"
                        value={url.validity}
                        onChange={(event) => handleChange(index, event)}
                        sx={{ mr: 2 }}
                    />
                    <IconButton onClick={() => handleRemoveFields(index)} disabled={urls.length === 1}>
                        <RemoveCircleOutline />
                    </IconButton>
                </Box>
            ))}
            <IconButton onClick={handleAddFields} disabled={urls.length >= 5}>
                <AddCircleOutline />
            </IconButton>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Shorten URLs
            </Button>
        </form>
    );
};

export default URLShortenerForm;
