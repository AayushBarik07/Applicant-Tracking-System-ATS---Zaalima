const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  archiveJob,
} = require('../controllers/jobController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (Recruiters only)
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.patch('/:id/archive', protect, authorize('recruiter'), archiveJob);

module.exports = router;

// Reviewed for production readiness.
