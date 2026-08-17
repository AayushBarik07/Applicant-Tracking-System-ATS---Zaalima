import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';

const Home = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch health endpoint:', err);
        setError('Could not connect to the backend server. Make sure it is running on port 5000.');
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          AI-Powered ATS
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            System Status
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, color: 'success.main', fontWeight: 'bold' }}>
              ✅ Frontend is running successfully!
            </Typography>

            {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {health && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Backend Status: {health.status} - {health.message}
              </Alert>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
