import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  Typography,
  Alert
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const InterviewDialog = ({ open, onClose, application, jobId }) => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/applications/${application._id}/interview`, 
        { date, time, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', jobId] });
      onClose();
      // Clear form
      setDate('');
      setTime('');
      setMessage('');
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to send interview invitation');
    }
  });

  const handleSubmit = () => {
    if (!date || !time) {
      setErrorMsg('Date and time are required');
      return;
    }
    inviteMutation.mutate();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Invite {application?.candidate?.name || 'Candidate'} to Interview
      </DialogTitle>
      <DialogContent>
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="textSecondary">
            This will send an automated email to the candidate and change their status to 'Interview'.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextField
              label="Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </Box>
          <TextField
            label="Additional Message"
            multiline
            rows={4}
            fullWidth
            placeholder="e.g. Please bring a copy of your resume and a photo ID..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={inviteMutation.isPending}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={inviteMutation.isPending}
        >
          {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterviewDialog;
