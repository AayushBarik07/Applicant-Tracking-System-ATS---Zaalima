import React from 'react';
import { Container, Typography, Box, Paper, Chip, CircularProgress, Alert, Button, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResumeUpload from '../components/ResumeUpload';

const fetchJobById = async (id) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-ats-zaalima-1.onrender.com/api'}/jobs/${id}`);
  return data;
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => fetchJobById(id),
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
        <Alert severity="error">Error loading job details: {error.message}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </Container>
    );
  }

  if (!job) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button onClick={() => navigate('/jobs')} sx={{ mb: 2 }}>
        &larr; Back to Job Board
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {job.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {job.companyName && (
            <Typography variant="subtitle1" color="text.secondary">
              🏢 {job.companyName}
            </Typography>
          )}
          {job.location && (
            <Typography variant="subtitle1" color="text.secondary">
              📍 {job.location}
            </Typography>
          )}
          {job.recruiter?.name && (
            <Typography variant="subtitle1" color="text.secondary">
              🏢 Posted by: {job.recruiter.name}
            </Typography>
          )}
          <Chip label={`Status: ${job.status}`} color={job.status === 'active' ? 'success' : 'default'} size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {job.description}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Experience Required
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {job.experienceRequired || 'Not specified'}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
          {job.skills?.length > 0 ? (
            job.skills.map((skill, index) => (
              <Chip key={index} label={skill} color="primary" variant="outlined" />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No specific skills listed.</Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          {user?.role === 'candidate' ? (
            <ResumeUpload jobId={job._id} />
          ) : user?.role === 'recruiter' ? (
            <Alert severity="info">You are logged in as a Recruiter. Candidates will see an Apply button here.</Alert>
          ) : (
            <Button variant="contained" size="large" color="primary" onClick={() => navigate('/login')}>
              Login to Apply
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default JobDetails;
