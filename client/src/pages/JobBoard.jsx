import React from 'react';
import { Container, Typography, Box, Card, CardContent, CardActions, Button, Chip, CircularProgress, Alert, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fetchJobs = async () => {
  const { data } = await axios.get((import.meta.env.VITE_API_URL || (import.meta.env.VITE_BASE_URL || 'http://localhost:5000')/api')/jobs');
  return data;
};

const JobBoard = () => {
  const navigate = useNavigate();
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading jobs: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Job Board
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }} color="text.secondary">
        Browse and apply for the latest active positions.
      </Typography>

      <Grid container spacing={3}>
        {jobs?.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No active jobs available at the moment.</Typography>
          </Grid>
        ) : (
          jobs?.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {job.title}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {job.location || 'Remote / Unspecified'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={`Exp: ${job.experienceRequired || 'Not specified'}`} size="small" variant="outlined" />
                    {job.skills?.slice(0, 3).map((skill, index) => (
                      <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                    ))}
                    {job.skills?.length > 3 && (
                      <Chip label={`+${job.skills.length - 3} more`} size="small" variant="outlined" />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" onClick={() => navigate(`/jobs/${job._id}`)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default JobBoard;
