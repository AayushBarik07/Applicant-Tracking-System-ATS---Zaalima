import React from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const CandidateDashboard = () => {
  const navigate = useNavigate();

  const fetchMyApplications = async () => {
    const token = localStorage.getItem('token');
    const { data } = await axios.get('http://localhost:5000/api/applications/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  };

  const { data: applications, isLoading, isError, error } = useQuery({
    queryKey: ['myApplications'],
    queryFn: fetchMyApplications,
  });

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Candidate Dashboard</Typography>
        <Button variant="contained" onClick={() => navigate('/jobs')}>
          Browse Open Jobs
        </Button>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 3 }}>Error: {error.message}</Alert>}

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        My Applications
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Job Title</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Date Applied</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : applications?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  You haven't applied to any jobs yet.
                </TableCell>
              </TableRow>
            ) : (
              applications?.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.job?.title || 'Unknown Job'}</TableCell>
                  <TableCell>{app.job?.location || 'N/A'}</TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={app.status} 
                      color={
                        app.status === 'Offered' ? 'success' : 
                        app.status === 'Rejected' ? 'error' : 
                        app.status === 'Interview' ? 'warning' : 'primary'
                      } 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      onClick={() => app.job?._id && navigate(`/jobs/${app.job._id}`)}
                      disabled={!app.job}
                    >
                      View Job
                    </Button>
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

export default CandidateDashboard;
