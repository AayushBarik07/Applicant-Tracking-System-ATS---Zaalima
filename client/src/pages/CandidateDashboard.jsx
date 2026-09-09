import React from 'react';
import { Container, Typography, Box, Button, Chip, CircularProgress, Alert, Grid, Paper, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchMyApplications = async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get((import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-ats-zaalima-1.onrender.com/api') + '/applications/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  };

  const { data: applications, isLoading, isError, error } = useQuery({
    queryKey: ['myApplications'],
    queryFn: fetchMyApplications,
  });

  const respondToInterview = useMutation({
    mutationFn: async ({ id, response }) => {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-ats-zaalima-1.onrender.com/api'}/applications/${id}/interview-response`, { response }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myApplications']);
    }
  });

  const respondToOffer = useMutation({
    mutationFn: async ({ id, response }) => {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-ats-zaalima-1.onrender.com/api'}/applications/${id}/offer-response`, { response }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myApplications']);
    }
  });

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          My Applications
        </Typography>
        <Button variant="contained" size="large" sx={{ borderRadius: 8, px: 4 }} onClick={() => navigate('/jobs')}>
          Browse Open Jobs
        </Button>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 3 }}>Error: {error.message}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : applications?.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: 4 }}>
          <WorkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            You haven't applied to any jobs yet.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start exploring opportunities and tracking your applications here!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications?.map((app) => (
            <Grid item xs={12} key={app._id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  transition: 'transform 0.2s', 
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  borderLeft: `6px solid ${
                    app.status === 'Offered' ? '#4caf50' : 
                    app.status === 'Rejected' ? '#f44336' : 
                    app.status === 'Interview' ? '#ff9800' : '#2196f3'
                  }`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  
                  {/* Left Side: Info */}
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {app.job?.title || 'Unknown Job'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      📍 {app.job?.location || 'Remote'} | Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={`Status: ${app.status}`} 
                        sx={{ 
                          fontWeight: 'bold',
                          backgroundColor: 
                            app.status === 'Offered' ? '#e8f5e9' : 
                            app.status === 'Rejected' ? '#ffebee' : 
                            app.status === 'Interview' ? '#fff3e0' : '#e3f2fd',
                          color: 
                            app.status === 'Offered' ? '#2e7d32' : 
                            app.status === 'Rejected' ? '#c62828' : 
                            app.status === 'Interview' ? '#ef6c00' : '#1565c0'
                        }} 
                      />
                      
                      {app.status === 'Interview' && app.candidateInterviewResponse === 'Pending' && (
                        <Chip icon={<AccessTimeIcon />} label="Action Required" color="warning" sx={{ ml: 1 }} />
                      )}
                      {app.status === 'Offered' && app.candidateOfferResponse === 'Pending' && (
                        <Chip icon={<AccessTimeIcon />} label="Action Required" color="warning" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </Box>

                  {/* Right Side: Actions */}
                  <Box sx={{ textAlign: 'right' }}>
                    
                    {/* Interview Action Workflow */}
                    {app.status === 'Interview' && (
                      <Box sx={{ mb: 2 }}>
                        {app.candidateInterviewResponse === 'Pending' ? (
                          <Stack direction="row" spacing={1}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => respondToInterview.mutate({ id: app._id, response: 'Accepted' })}
                              disabled={respondToInterview.isPending}
                            >
                              Accept Interview
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => respondToInterview.mutate({ id: app._id, response: 'Declined' })}
                              disabled={respondToInterview.isPending}
                            >
                              Decline
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color={app.candidateInterviewResponse === 'Accepted' ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                            {app.candidateInterviewResponse === 'Accepted' ? '✅ Interview Accepted' : '❌ Interview Declined'}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Offer Action Workflow */}
                    {app.status === 'Offered' && (
                      <Box sx={{ mb: 2 }}>
                        {app.candidateOfferResponse === 'Pending' ? (
                          <Stack direction="row" spacing={1}>
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => respondToOffer.mutate({ id: app._id, response: 'Accepted' })}
                              disabled={respondToOffer.isPending}
                            >
                              Accept Offer
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => respondToOffer.mutate({ id: app._id, response: 'Declined' })}
                              disabled={respondToOffer.isPending}
                            >
                              Decline Offer
                            </Button>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color={app.candidateOfferResponse === 'Accepted' ? 'success.main' : 'error.main'} sx={{ fontWeight: 'bold' }}>
                            {app.candidateOfferResponse === 'Accepted' ? '🎉 Offer Accepted!' : '❌ Offer Declined'}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Button 
                      variant="text" 
                      onClick={() => app.job?._id && navigate(`/jobs/${app.job._id}`)}
                      disabled={!app.job}
                    >
                      View Job Details &rarr;
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CandidateDashboard;
