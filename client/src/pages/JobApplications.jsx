import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, MenuItem, Select, FormControl } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');

  const api = axios.create({ baseURL: 'http://localhost:5000/api' });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const { data: applications, isLoading, isError, error } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/applications/job/${jobId}`);
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ appId, status }) => api.patch(`/applications/${appId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update status');
    }
  });

  const handleStatusChange = (appId, newStatus) => {
    updateStatus.mutate({ appId, status: newStatus });
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading applications: {error.message}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/recruiter')}>Back to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Button onClick={() => navigate('/recruiter')} sx={{ mb: 2 }}>
        &larr; Back to Dashboard
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Manage Applications
      </Typography>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Candidate Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Applied Date</strong></TableCell>
              <TableCell><strong>Resume</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No applications received for this job yet.
                </TableCell>
              </TableRow>
            ) : (
              applications?.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.candidate?.name}</TableCell>
                  <TableCell>{app.candidate?.email}</TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => window.open(`http://localhost:5000${app.resumePath}`, '_blank')}
                    >
                      View Resume
                    </Button>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        disabled={updateStatus.isPending}
                        sx={{
                          backgroundColor: 
                            app.status === 'Offered' ? '#e8f5e9' : 
                            app.status === 'Rejected' ? '#ffebee' : 
                            app.status === 'Interview' ? '#fff3e0' : '#e3f2fd'
                        }}
                      >
                        <MenuItem value="Applied">Applied</MenuItem>
                        <MenuItem value="Interview">Interview</MenuItem>
                        <MenuItem value="Offered">Offered</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default JobApplications;
