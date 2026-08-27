import React, { useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Grid, Paper, Card, CardContent, 
  Avatar, LinearProgress, Stack, Chip, Divider 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SpeedIcon from '@mui/icons-material/Speed';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SortIcon from '@mui/icons-material/Sort';

// Mock Dashboard Component for the Hero Section
const DashboardPreview = () => (
  <Paper 
    elevation={6} 
    sx={{ 
      borderRadius: 4, 
      overflow: 'hidden', 
      bgcolor: '#fff',
      border: '1px solid #e0e0e0',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
    }}
  >
    <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', p: 2, alignItems: 'center', bgcolor: '#f8fafc' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
      </Box>
      <Typography sx={{ ml: 2, fontSize: '0.85rem', color: 'text.secondary', fontWeight: 500 }}>
        Recruiter Dashboard
      </Typography>
    </Box>
    <Grid container>
      {/* Mini Sidebar */}
      <Grid item xs={3} sx={{ borderRight: '1px solid #eee', p: 2, bgcolor: '#fafafa', display: { xs: 'none', sm: 'block' } }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <AssessmentIcon fontSize="small" /> <Typography variant="caption" fontWeight="bold">Dashboard</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <AssignmentIcon fontSize="small" /> <Typography variant="caption">Active Jobs</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <PeopleIcon fontSize="small" /> <Typography variant="caption">Candidates</Typography>
          </Box>
        </Stack>
      </Grid>
      
      {/* Dashboard Content */}
      <Grid item xs={12} sm={9} sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Frontend Developer - Remote
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Total Applicants</Typography>
              <Typography variant="h6" fontWeight="bold">142</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Shortlisted</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">24</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Hired</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">1</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          Top AI Matches
        </Typography>
        
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {[
            { name: "Sarah Jenkins", score: 95, color: "success" },
            { name: "David Chen", score: 88, color: "success" },
            { name: "Michael Ross", score: 76, color: "warning" }
          ].map((c) => (
            <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: `${c.color}.light` }}>
                {c.name.charAt(0)}
              </Avatar>
              <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>{c.name}</Typography>
              <Box sx={{ width: '40%' }}>
                <LinearProgress variant="determinate" value={c.score} color={c.color} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              <Typography variant="caption" fontWeight="bold">{c.score}%</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
    </Grid>
  </Paper>
);

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle anchor links on initial load or navigation
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  return (
    <Box sx={{ bgcolor: '#fafbfd', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 }, overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Chip 
                label="AI-Powered Recruitment Platform" 
                color="primary" 
                size="small" 
                sx={{ mb: 3, fontWeight: 600, bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main' }} 
              />
              <Typography variant="h2" component="h1" fontWeight="800" sx={{ mb: 2, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.2 }}>
                Smarter Hiring, <br />
                <Box component="span" sx={{ color: 'primary.main' }}>Faster Decisions.</Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
                An intelligent Applicant Tracking System that helps companies find the right talent faster with AI-powered resume analysis and smart candidate matching.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/jobs')}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, boxShadow: '0 8px 16px rgba(25, 118, 210, 0.2)' }}
                >
                  Browse Jobs
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                  Get Started
                </Button>
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <SmartToyIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">AI Resume Analysis</Typography>
                      <Typography variant="caption" color="text.secondary">Smart candidate screening</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TaskAltIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Streamlined Hiring</Typography>
                      <Typography variant="caption" color="text.secondary">End-to-end recruitment</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <SpeedIcon color="primary" fontSize="small" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">Faster Hiring</Typography>
                      <Typography variant="caption" color="text.secondary">Focus on the best talent</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                {/* Decorative background blobs */}
                <Box 
                  sx={{ 
                    position: 'absolute', top: -40, right: -40, width: 300, height: 300, 
                    borderRadius: '50%', background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0) 100%)', zIndex: 0 
                  }} 
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <DashboardPreview />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust / Value Section */}
      <Box sx={{ py: 6, bgcolor: 'white', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight="600" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Built for smarter, skill-based hiring
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center">
            {['Skill-Based Matching', 'AI Resume Analysis', 'Faster Candidate Screening', 'Complete Hiring Workflow'].map((benefit) => (
              <Grid item xs={6} sm={3} key={benefit}>
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {benefit}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" align="center" sx={{ mb: 6 }}>
            Why Choose Zaalima ATS?
          </Typography>
          <Grid container spacing={4}>
            {[
              { title: 'AI-Powered Matching', desc: 'Compare candidates against job requirements using AI.', icon: <SmartToyIcon fontSize="large" color="primary" /> },
              { title: 'Smart Resume Parsing', desc: 'Extract useful information from uploaded resumes instantly.', icon: <SearchIcon fontSize="large" color="primary" /> },
              { title: 'Automated Hiring Workflow', desc: 'Track candidates from application to interview and offer.', icon: <TaskAltIcon fontSize="large" color="primary" /> },
              { title: 'Candidate Ranking', desc: 'Find the strongest matches using AI-generated scores and filters.', icon: <SortIcon fontSize="large" color="primary" /> }
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card elevation={0} sx={{ height: '100%', bgcolor: 'transparent', border: 'none' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ mb: 2, p: 2, display: 'inline-block', borderRadius: 3, bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{feature.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" align="center" sx={{ mb: 8 }}>
            How It Works
          </Typography>
          <Stack spacing={6}>
            {[
              { step: 1, title: 'Post a Job', desc: 'Recruiters create and publish job openings.', icon: <AddCircleOutlineIcon fontSize="large" /> },
              { step: 2, title: 'Candidates Apply', desc: 'Candidates upload their resumes and apply for jobs.', icon: <UploadFileIcon fontSize="large" /> },
              { step: 3, title: 'AI Helps Rank Candidates', desc: 'Resume information is analyzed and compared with job requirements.', icon: <AssessmentIcon fontSize="large" /> }
            ].map((item) => (
              <Box key={item.step} sx={{ display: 'flex', alignItems: 'center', gap: 4, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
                <Box 
                  sx={{ 
                    minWidth: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    boxShadow: '0 10px 20px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Step {item.step}: {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Recruiter + Candidate Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            
            <Grid item xs={12} md={6} id="recruiters">
              <Paper elevation={3} sx={{ p: 5, height: '100%', borderRadius: 4, bgcolor: '#0f172a', color: 'white' }}>
                <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 'bold', letterSpacing: 1.5 }}>
                  For Employers
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, mb: 3 }}>
                  Recruiters
                </Typography>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  {['Create and manage jobs', 'View applicants', 'Analyze candidates', 'Track application stages', 'Send interview emails'].map(item => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TaskAltIcon sx={{ color: 'primary.light' }} />
                      <Typography variant="body1">{item}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Button variant="contained" color="primary" onClick={() => navigate('/register')} sx={{ borderRadius: 2 }}>
                  Start Hiring
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} id="candidates">
              <Paper elevation={3} sx={{ p: 5, height: '100%', borderRadius: 4, bgcolor: 'white' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', letterSpacing: 1.5 }}>
                  For Job Seekers
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, mb: 3 }}>
                  Candidates
                </Typography>
                <Stack spacing={2} sx={{ mb: 4 }}>
                  {['Browse jobs', 'Apply with resume', 'Track applications', 'Receive status updates'].map(item => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TaskAltIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="body1" color="text.secondary">{item}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Button variant="outlined" color="primary" onClick={() => navigate('/jobs')} sx={{ borderRadius: 2, borderWidth: 2, '&:hover':{ borderWidth: 2 } }}>
                  Find Jobs
                </Button>
              </Paper>
            </Grid>
            
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ py: 10, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to make hiring simpler?
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, fontWeight: 400, opacity: 0.9 }}>
            Connect the right candidates with the right opportunities.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/jobs')}
              sx={{ bgcolor: 'white', color: 'primary.main', px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#f0f0f0' } }}
            >
              Browse Jobs
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ color: 'white', borderColor: 'white', px: 4, py: 1.5, borderRadius: 2, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2, borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Get Started
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0b1120', color: '#94a3b8', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>
                Zaalima ATS
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6, pr: { md: 4 } }}>
                An intelligent Applicant Tracking System designed to streamline the recruitment process with AI-powered resume analysis and matching.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>Product</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/jobs')}>Jobs</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/#features')}>Features</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', mb: 2 }}>Account</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/login')}>Login</Typography>
                <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }} onClick={() => navigate('/register')}>Register</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
          <Typography variant="body2" align="center">
            &copy; {new Date().getFullYear()} Zaalima ATS. All rights reserved.
          </Typography>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;
