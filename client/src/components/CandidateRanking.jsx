import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';

const CandidateRanking = ({ applications, onAnalyze, onInvite }) => {
  const [minScore, setMinScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortMethod, setSortMethod] = useState('highest');

  // Filter and sort logic
  const processedApplications = useMemo(() => {
    let result = [...(applications || [])];

    // Filter by min score
    result = result.filter(app => {
      const score = app.aiScore !== undefined ? app.aiScore : 0;
      return score >= minScore;
    });

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter(app => app.status === statusFilter);
    }

    // Filter by skill (case insensitive, checks matchedSkills and extractedSkills)
    if (skillFilter.trim()) {
      const searchTerm = skillFilter.toLowerCase().trim();
      result = result.filter(app => {
        const skills = [...(app.matchedSkills || []), ...(app.extractedSkills || [])];
        return skills.some(skill => skill.toLowerCase().includes(searchTerm));
      });
    }

    // Sort
    result.sort((a, b) => {
      const scoreA = a.aiScore !== undefined ? a.aiScore : -1;
      const scoreB = b.aiScore !== undefined ? b.aiScore : -1;

      if (sortMethod === 'highest') {
        return scoreB - scoreA;
      }
      if (sortMethod === 'lowest') {
        return scoreA - scoreB;
      }
      if (sortMethod === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    return result;
  }, [applications, minScore, statusFilter, skillFilter, sortMethod]);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold">Filters:</Typography>
        
        <TextField
          label="Min Score"
          type="number"
          size="small"
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value) || 0)}
          inputProps={{ min: 0, max: 100 }}
          sx={{ width: 120 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Applied">Applied</MenuItem>
            <MenuItem value="Interview">Interview</MenuItem>
            <MenuItem value="Offered">Offered</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Filter by Skill"
          size="small"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 2 }}>Sort:</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortMethod}
            label="Sort By"
            onChange={(e) => setSortMethod(e.target.value)}
          >
            <MenuItem value="highest">Highest Score</MenuItem>
            <MenuItem value="lowest">Lowest Score</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Candidate</strong></TableCell>
              <TableCell><strong>AI Score</strong></TableCell>
              <TableCell><strong>Skills / Experience</strong></TableCell>
              <TableCell><strong>AI Summary</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No candidates match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              processedApplications.map((app) => (
                <TableRow key={app._id} hover>
                  <TableCell>
                    <Typography fontWeight="bold">{app.candidate?.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{app.candidate?.email}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => window.open(`http://localhost:5000${app.resumePath}`, '_blank')}
                        sx={{ p: 0.5, minWidth: 'auto' }}
                      >
                        Resume
                      </Button>
                      <Button 
                        size="small" 
                        color="primary"
                        variant="contained"
                        onClick={() => onInvite(app._id)}
                        sx={{ p: 0.5, minWidth: 'auto' }}
                      >
                        Invite
                      </Button>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {app.aiScore !== undefined ? (
                      <Chip 
                        label={`${app.aiScore}/100`}
                        color={app.aiScore >= 75 ? "success" : app.aiScore >= 50 ? "warning" : "error"}
                        sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                      />
                    ) : (
                      <Button size="small" variant="outlined" onClick={() => onAnalyze(app._id)}>
                        Analyze
                      </Button>
                    )}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="textSecondary" display="block">Matched Skills:</Typography>
                      {app.matchedSkills && app.matchedSkills.length > 0 ? (
                        app.matchedSkills.map(skill => (
                          <Chip key={skill} label={skill} size="small" color="primary" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="body2">-</Typography>
                      )}
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="textSecondary" display="block">Missing Skills:</Typography>
                      {app.missingSkills && app.missingSkills.length > 0 ? (
                        app.missingSkills.map(skill => (
                          <Chip key={skill} label={skill} size="small" color="error" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="body2">-</Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary" display="block">Experience:</Typography>
                    <Typography variant="body2">{app.experience || 'N/A'}</Typography>
                  </TableCell>

                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" sx={{ 
                      display: '-webkit-box', 
                      WebkitLineClamp: 4, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden' 
                    }}>
                      {app.aiSummary || 'Not analyzed yet.'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip 
                      label={app.status}
                      size="small"
                      sx={{
                        bgcolor: 
                          app.status === 'Offered' ? '#e8f5e9' : 
                          app.status === 'Rejected' ? '#ffebee' : 
                          app.status === 'Interview' ? '#fff3e0' : '#e3f2fd'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CandidateRanking;
