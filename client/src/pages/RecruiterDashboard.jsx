import React, { useState } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert, IconButton } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JobFormDialog from '../components/JobFormDialog';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formError, setFormError] = useState('');

  const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-ats-zaalima-1.onrender.com/api')  });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Fetch recruiter's jobs
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['recruiterJobs', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs?recruiterId=${user?._id}`);
      return data;
    },
    enabled: !!user?._id,
  });

  // Mutations
  const createJob = useMutation({
    mutationFn: (newJob) => api.post('/jobs', newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      handleCloseForm();
    },
    onError: (err) => setFormError(err.response?.data?.message || 'Failed to create job'),
  });

  const updateJob = useMutation({
    mutationFn: ({ id, data }) => api.put(`/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      handleCloseForm();
    },
    onError: (err) => setFormError(err.response?.data?.message || 'Failed to update job'),
  });

  const archiveJob = useMutation({
    mutationFn: (id) => api.patch(`/jobs/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const deleteJob = useMutation({
    mutationFn: (id) => api.delete(`/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this job posting?')) {
      deleteJob.mutate(id);
    }
  };

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormError('');
    setFormOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormError('');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingJob(null);
  };

  const handleSubmitForm = (formData) => {
    if (editingJob) {
      updateJob.mutate({ id: editingJob._id, data: formData });
    } else {
      createJob.mutate(formData);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">My Jobs</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          + Post New Job
        </Button>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 3 }}>Error: {error.message}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Date Posted</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : jobs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  You haven't posted any jobs yet.
                </TableCell>
              </TableRow>
            ) : (
              jobs?.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.location || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={job.status} 
                      color={job.status === 'active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => navigate(`/recruiter/jobs/${job._id}/applications`)}
                      sx={{ mr: 1 }}
                    >
                      Applications
                    </Button>
                    <Button size="small" onClick={() => handleOpenEdit(job)} sx={{ mr: 1 }}>Edit</Button>
                    {job.status === 'active' && (
                      <Button 
                        size="small" 
                        color="warning" 
                        onClick={() => archiveJob.mutate(job._id)}
                        disabled={archiveJob.isPending}
                      >
                        Archive
                      </Button>
                    )}
                    <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleDelete(job._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <JobFormDialog 
        open={formOpen} 
        onClose={handleCloseForm} 
        onSubmit={handleSubmitForm}
        initialData={editingJob}
        isLoading={createJob.isPending || updateJob.isPending}
        error={formError}
      />
    </Container>
  );
};

export default RecruiterDashboard;


