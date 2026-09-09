import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, 
  Drawer, List, ListItem, ListItemText, useTheme, useMediaQuery, Chip 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'How It Works', path: '/#how-it-works', showOnHome: true },
    { label: 'Features', path: '/#features', showOnHome: true },
    { label: 'For Recruiters', path: '/#recruiters', showOnHome: true },
    { label: 'For Candidates', path: '/#candidates', showOnHome: true },
  ];

  const handleNavigation = (path) => {
    if (path.startsWith('/#')) {
      if (isHome) {
        const id = path.split('#')[1];
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
    }
    setMobileOpen(false);
  };

  const renderNavLinks = () => (
    navLinks.map((link) => {
      // If not on home page, maybe don't show the anchor links, or navigate to them.
      // We'll show them and let handleNavigation deal with it.
      const isActive = link.path === '/' && isHome;
      return (
        <Button 
          key={link.label} 
          onClick={() => handleNavigation(link.path)}
          sx={{ 
            color: isActive ? 'primary.main' : 'text.primary', 
            fontWeight: isActive ? 600 : 400,
            mx: 0.5,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {link.label}
        </Button>
      );
    })
  );

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', padding: { xs: '0.5rem 1rem', md: '0.5rem 4rem' } }}>
        <Typography 
          variant="h5" 
          component="div" 
          onClick={() => navigate('/')} 
          sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}
        >
          Zaalima ATS
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderNavLinks()}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && user ? (
              <>
                <Chip label={user.role === 'recruiter' ? 'Recruiter' : 'Candidate'} color={user.role === 'recruiter' ? 'primary' : 'success'} size="small" sx={{ mr: 1, fontWeight: 'bold', textTransform: 'capitalize' }} />
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Dashboard
              </Button>
              <Button onClick={handleLogout} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                Logout
              </Button>
            </>
          ) : !isMobile && !user ? (
            <>
              <Button 
                onClick={() => navigate('/login')} 
                sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 500 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none', borderRadius: 2, px: 3, boxShadow: 'none' }}
              >
                Register
              </Button>
            </>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: 'primary.main' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List>
            {navLinks.map((link) => (
              <ListItem button key={link.label} onClick={() => handleNavigation(link.path)}>
                <ListItemText primary={link.label} sx={{ color: (link.path === '/' && isHome) ? 'primary.main' : 'text.primary' }} />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {user ? (
                <>
                <Chip label={user.role === 'recruiter' ? 'Recruiter' : 'Candidate'} color={user.role === 'recruiter' ? 'primary' : 'success'} sx={{ mb: 1, fontWeight: 'bold', textTransform: 'capitalize' }} />
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => {
                    navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate');
                    setMobileOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button fullWidth onClick={handleLogout} color="error">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                  Login
                </Button>
                <Button variant="contained" fullWidth onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;



