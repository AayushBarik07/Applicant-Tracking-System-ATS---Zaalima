import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';

const JobFormDialog = ({ open, onClose, onSubmit, initialData, isLoading, error }) => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    skills: '',
    experienceRequired: '',
    location: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        companyName: initialData.companyName || '',
        description: initialData.description || '',
        skills: initialData.skills ? initialData.skills.join(', ') : '',
        experienceRequired: initialData.experienceRequired || '',
        location: initialData.location || '',
      });
    } else {
      setFormData({ title: '', companyName: '', description: '', skills: '', experienceRequired: '', location: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert skills string to array
    const payload = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Job' : 'Create New Job'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Experience Required (e.g., 2-4 years)"
              name="experienceRequired"
              value={formData.experienceRequired}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              fullWidth
              helperText="e.g. React, Node.js, MongoDB"
            />
            <TextField
              label="Job Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobFormDialog;
