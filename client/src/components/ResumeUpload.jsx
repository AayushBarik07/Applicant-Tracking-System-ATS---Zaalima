import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const ResumeUpload = ({ jobId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Basic frontend validation
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF or DOCX files are allowed.');
        setFile(null);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobId', jobId);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post((import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || (import.meta.env.VITE_BASE_URL || '${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}') + '/api'}') + '/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess(response.data.message || 'Application submitted successfully!');
      setFile(null);
      // Clear file input
      document.getElementById('resume-upload').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6">Upload your Resume to Apply</Typography>
      <input
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        id="resume-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="resume-upload">
        <Button variant="outlined" component="span" disabled={uploading}>
          Select Resume (PDF/DOCX)
        </Button>
      </label>

      {file && <Typography variant="body2">Selected: {file.name}</Typography>}
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
      </Button>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
    </Box>
  );
};

export default ResumeUpload;
