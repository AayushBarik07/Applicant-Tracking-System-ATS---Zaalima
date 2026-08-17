import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If they are a recruiter trying to access a candidate page (or vice versa), redirect to their own dashboard
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/candidate'} />;
  }

  return children;
};

export default ProtectedRoute;
