const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Example of role-protected routes (to test middleware)
router.get('/recruiter-only', protect, authorize('recruiter'), (req, res) => {
  res.status(200).json({ message: 'Welcome Recruiter' });
});

router.get('/candidate-only', protect, authorize('candidate'), (req, res) => {
  res.status(200).json({ message: 'Welcome Candidate' });
});

module.exports = router;
