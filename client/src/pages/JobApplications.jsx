import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert, Card, CardContent, CardActions, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [aiBreakdownAppId, setAiBreakdownAppId] = useState(null);

  const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || (import.meta.env.VITE_BASE_URL || 'http://localhost:5000')/api')' });
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
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 4, pt: 1, px: 1 }}>
        {COLUMNS.map((column) => (
          <Paper
            key={column}
            elevation={0}
            sx={{
              flex: '1 1 320px',
              minWidth: '320px',
              bgcolor: 
                column === 'Applied' ? '#f0f4f8' :
                column === 'Interview' ? '#fff8e1' :
                column === 'Offered' ? '#e8f5e9' : '#ffebee',
              p: 2.5,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 
                column === 'Applied' ? '#d9e2ec' :
                column === 'Interview' ? '#ffecb3' :
                column === 'Offered' ? '#c8e6c9' : '#ffcdd2',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '650px',
              boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: 
                  column === 'Applied' ? '#334e68' :
                  column === 'Interview' ? '#b7791f' :
                  column === 'Offered' ? '#276749' : '#c53030'
              }}>
                {column}
              </Typography>
              <Chip 
                label={groupedApps[column].length} 
                size="small" 
                sx={{ 
                  fontWeight: 'bold', 
                  bgcolor: 'rgba(0,0,0,0.08)',
                  color: 'text.secondary'
                }} 
              />
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {groupedApps[column].map((app) => (
                <Card 
                  key={app._id} 
                  elevation={2}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app._id)}
                  sx={{ 
                    cursor: 'grab', 
                    borderRadius: 3,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                    '&:active': { cursor: 'grabbing', transform: 'scale(0.98)' },
                    borderTop: '5px solid',
                    borderColor: 
                      column === 'Applied' ? '#2b6cb0' :
                      column === 'Interview' ? '#dd6b20' :
                      column === 'Offered' ? '#38a169' : '#e53e3e'
                  }}
                >
                  <CardContent sx={{ pb: 1, px: 2.5, pt: 2.5 }}>
                    <Typography variant="h6" fontSize={17} fontWeight="700" sx={{ mb: 0.5 }}>
                      {app.candidate?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>
                      {app.candidate?.email}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Chip size="small" variant="outlined" label={`Applied: ${new Date(app.createdAt).toLocaleDateString()}`} />
                      
                      {app.aiScore !== undefined && (
                        <Chip 
                          label={`AI Score: ${app.aiScore}`} 
                          size="small" 
                          color={app.aiScore >= 75 ? "success" : app.aiScore >= 50 ? "warning" : "error"}
                          sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                          onClick={() => setAiBreakdownAppId(app._id)}
                        />
                      )}
                    </Box>

                    {/* Candidate Response Status Display */}
                    {column === 'Interview' && (
                      <Box sx={{ mt: 2, p: 1, borderRadius: 1.5, bgcolor: app.candidateInterviewResponse === 'Accepted' ? '#f0fdf4' : app.candidateInterviewResponse === 'Declined' ? '#fef2f2' : '#fffbeb' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: app.candidateInterviewResponse === 'Accepted' ? '#166534' : app.candidateInterviewResponse === 'Declined' ? '#991b1b' : '#92400e' }}>
                          {app.candidateInterviewResponse === 'Accepted' ? '✅ Interview Accepted' : app.candidateInterviewResponse === 'Declined' ? '❌ Interview Declined' : '⏳ Waiting for candidate response...'}
                        </Typography>
                      </Box>
                    )}

                    {column === 'Offered' && (
                      <Box sx={{ mt: 2, p: 1, borderRadius: 1.5, bgcolor: app.candidateOfferResponse === 'Accepted' ? '#f0fdf4' : app.candidateOfferResponse === 'Declined' ? '#fef2f2' : '#fffbeb' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: app.candidateOfferResponse === 'Accepted' ? '#166534' : app.candidateOfferResponse === 'Declined' ? '#991b1b' : '#92400e' }}>
                          {app.candidateOfferResponse === 'Accepted' ? '🎉 Offer Accepted!' : app.candidateOfferResponse === 'Declined' ? '❌ Offer Declined' : '⏳ Waiting for candidate response...'}
                        </Typography>
                      </Box>
                    )}

                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, pt: 1, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Button size="small" sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }} color="inherit" onClick={() => window.open(app.resumePath.startsWith('http') ? app.resumePath : ${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${app.resumePath}`, '_blank')}>
                        📄 View Resume
                      </Button>
                      <Button size="small" sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }} color="primary" onClick={() => triggerAnalysis.mutate(app._id)} disabled={triggerAnalysis.isPending}>
                        {app.aiScore !== undefined ? '🔄 Re-Analyze' : '✨ Analyze AI'}
                      </Button>
                    </Box>
                    
                    <Divider sx={{ my: 0.5, opacity: 0.6 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      {/* Left Side Workflow Action (Reject/Withdraw) */}
                      {column !== 'Rejected' ? (
                        <Button 
                          size="small" 
                          color="error" 
                          sx={{ textTransform: 'none', fontWeight: 600 }} 
                          onClick={() => handleStatusChange(app._id, 'Rejected')}
                        >
                          Reject
                        </Button>
                      ) : (
                        <Button 
                          size="small" 
                          color="primary" 
                          sx={{ textTransform: 'none', fontWeight: 600 }} 
                          onClick={() => handleStatusChange(app._id, 'Applied')}
                        >
                          Reconsider
                        </Button>
                      )}

                      {/* Right Side Workflow Action (Forward Progress) */}
                      {column === 'Applied' && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="primary" 
                          sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 600, boxShadow: 2 }} 
                          onClick={() => setInterviewAppId(app._id)}
                        >
                          Shortlist for Interview
                        </Button>
                      )}

                      {column === 'Interview' && (
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="success" 
                          sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 600, boxShadow: 2 }} 
                          onClick={() => handleStatusChange(app._id, 'Offered')}
                        >
                          Make Job Offer
                        </Button>
                      )}

                      {column === 'Offered' && app.candidateOfferResponse === 'Pending' && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="warning" 
                          sx={{ borderRadius: 6, textTransform: 'none', fontWeight: 600 }} 
                          onClick={() => handleStatusChange(app._id, 'Rejected')}
                        >
                          Withdraw Offer
                        </Button>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              ))}
              
              {groupedApps[column].length === 0 && (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: 3, p: 3, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Drop candidates here
                  </Typography>
                </Box>
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

      {/* AI Breakdown Dialog */}
      {aiBreakdownAppId && (
        <Dialog 
          open={!!aiBreakdownAppId} 
          onClose={() => setAiBreakdownAppId(null)} 
          maxWidth="md" 
          fullWidth
        >
          {(() => {
            const app = applications?.find(a => a._id === aiBreakdownAppId);
            if (!app) return null;
            return (
              <>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', pb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">AI Match Analysis</Typography>
                  <Typography variant="subtitle2">
                    {app.candidate?.name} • Score: {app.aiScore}/100
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Why this score? (Based strictly on the Job Description)
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      "{app.aiSummary || 'No summary available.'}"
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {/* Matched Skills */}
                    <Box sx={{ flex: 1, minWidth: '250px' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon fontSize="small" /> Skills that matched the JD
                      </Typography>
                      {app.matchedSkills?.length > 0 ? (
                        <List dense>
                          {app.matchedSkills.map((skill, idx) => (
                            <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon color="success" fontSize="inherit" /></ListItemIcon>
                              <ListItemText primary={skill} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No matched skills found.</Typography>
                      )}
                    </Box>

                    {/* Missing Skills */}
                    <Box sx={{ flex: 1, minWidth: '250px' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon fontSize="small" /> Required Skills Missing
                      </Typography>
                      {app.missingSkills?.length > 0 ? (
                        <List dense>
                          {app.missingSkills.map((skill, idx) => (
                            <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}><CancelIcon color="error" fontSize="inherit" /></ListItemIcon>
                              <ListItemText primary={skill} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No missing skills!</Typography>
                      )}
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                  <Button onClick={() => setAiBreakdownAppId(null)} variant="contained">
                    Close
                  </Button>
                </DialogActions>
              </>
            );
          })()}
        </Dialog>
      )}
    </Container>
  );
};

export default JobApplications;
