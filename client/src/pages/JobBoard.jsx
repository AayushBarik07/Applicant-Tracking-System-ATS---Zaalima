import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, CardActions, Button, Chip, CircularProgress, Alert, Grid, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const fetchJobs = async () => {
  const { data } = await axios.get((import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-ats-zaalima-1.onrender.com/api') + '/jobs');
  return data;
};

const JobBoard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <Container sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Job Board
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }} color="text.secondary">
        Browse and apply for the latest active positions.
      </Typography>

      <TextField 
        fullWidth 
        variant="outlined" 
        placeholder="Search jobs by title, location, or skills..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4, backgroundColor: 'white' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredJobs?.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', p: 4, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">No active jobs match your search.</Typography>
              <Button sx={{ mt: 2 }} onClick={() => setSearchTerm('')}>Clear Search</Button>
            </Box>
          </Grid>
        ) : (
          filteredJobs?.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" fontWeight="bold">
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
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="contained" fullWidth onClick={() => navigate(`/jobs/${job._id}`)}>
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
