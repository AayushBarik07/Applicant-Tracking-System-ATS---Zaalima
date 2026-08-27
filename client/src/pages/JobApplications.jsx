import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert, Card, CardContent, CardActions, Chip, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import CandidateRanking from '../components/CandidateRanking';
import InterviewDialog from '../components/InterviewDialog';

const COLUMNS = ['Applied', 'Interview', 'Offered', 'Rejected'];

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [view, setView] = useState('board'); // 'board' | 'ranking'
  const [interviewAppId, setInterviewAppId] = useState(null);

  const api = axios.create({ baseURL: 'http://localhost:5000/api' });
// ... existing axios config ...
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

  const triggerAnalysis = useMutation({
    mutationFn: (appId) => api.post(`/applications/${appId}/analyze`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to analyze candidate');
    }
  });

  const handleStatusChange = (appId, newStatus) => {
    updateStatus.mutate({ appId, status: newStatus });
  };

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('appId', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (appId) {
      const app = applications?.find(a => a._id === appId);
      if (app && app.status !== status) {
        handleStatusChange(appId, status);
      }
    }
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

  const groupedApps = COLUMNS.reduce((acc, col) => {
    acc[col] = applications?.filter(app => app.status === col) || [];
    return acc;
  }, {});

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/recruiter')} sx={{ mb: 2 }}>
        &larr; Back to Dashboard
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Applications
        </Typography>
        <Box>
          <Button 
            variant={view === 'board' ? 'contained' : 'outlined'} 
            onClick={() => setView('board')}
            sx={{ mr: 1 }}
          >
            Pipeline Board
          </Button>
          <Button 
            variant={view === 'ranking' ? 'contained' : 'outlined'} 
            onClick={() => setView('ranking')}
          >
            AI Ranking
          </Button>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {updateStatus.isPending && <Alert severity="info" sx={{ mb: 3 }}>Updating status...</Alert>}
      {triggerAnalysis.isPending && <Alert severity="info" sx={{ mb: 3 }}>Analyzing candidate fit with AI...</Alert>}

      {view === 'ranking' ? (
        <CandidateRanking 
          applications={applications} 
          onAnalyze={(id) => triggerAnalysis.mutate(id)} 
          onInvite={(id) => setInterviewAppId(id)}
        />
      ) : (
        <Box>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Drag and drop candidate cards to update their status.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {COLUMNS.map((column) => (
          <Paper
            key={column}
            elevation={2}
            sx={{
              flex: '1 1 300px',
              minWidth: '300px',
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '600px'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              {column}
              <Chip label={groupedApps[column].length} size="small" />
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groupedApps[column].map((app) => (
                <Card 
                  key={app._id} 
                  elevation={3}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app._id)}
                  sx={{ 
                    cursor: 'grab', 
                    '&:active': { cursor: 'grabbing' },
                    borderTop: '4px solid',
                    borderColor: 
                      column === 'Applied' ? 'primary.main' :
                      column === 'Interview' ? 'warning.main' :
                      column === 'Offered' ? 'success.main' : 'error.main'
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="h6" fontSize={18} fontWeight="bold">
                      {app.candidate?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {app.candidate?.email}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </Typography>
                    
                    {app.aiScore !== undefined && (
                      <Chip 
                        label={`AI Score: ${app.aiScore}/100`} 
                        size="small" 
                        color={app.aiScore >= 75 ? "success" : app.aiScore >= 50 ? "warning" : "error"}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => window.open(`http://localhost:5000${app.resumePath}`, '_blank')}
                    >
                      Resume
                    </Button>
                    <Button 
                      size="small" 
                      color="secondary"
                      disabled={triggerAnalysis.isPending}
                      onClick={() => triggerAnalysis.mutate(app._id)}
                    >
                      {app.aiScore !== undefined ? 'Re-Analyze' : 'Analyze AI'}
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => setInterviewAppId(app._id)}
                    >
                      Invite
                    </Button>
                  </CardActions>
                </Card>
              ))}
              
              {groupedApps[column].length === 0 && (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4, fontStyle: 'italic' }}>
                  No candidates in this stage
                </Typography>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
      </Box>
      )}

      {interviewAppId && (
        <InterviewDialog 
          open={!!interviewAppId} 
          onClose={() => setInterviewAppId(null)} 
          application={applications?.find(a => a._id === interviewAppId)}
          jobId={jobId}
        />
      )}
    </Container>
  );
};

export default JobApplications;
