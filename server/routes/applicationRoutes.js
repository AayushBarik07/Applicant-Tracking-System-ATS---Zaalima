const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const { 
  createApplication, 
  getMyApplications,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
  triggerAnalysis,
  inviteToInterview
} = require('../controllers/applicationController');

// @route   POST /api/applications
// @desc    Apply for a job (Uploads resume and creates application)
// @access  Private (Candidate only)
router.post('/', protect, authorize('candidate'), upload.single('resume'), createApplication);

// @route   GET /api/applications/my
// @desc    Get logged-in candidate's applications
// @access  Private (Candidate only)
router.get('/my', protect, authorize('candidate'), getMyApplications);

// @route   POST /api/applications/:id/analyze
// @desc    Trigger AI analysis for an application against the job
// @access  Private (Recruiter only)
router.post('/:id/analyze', protect, authorize('recruiter'), triggerAnalysis);

// @route   POST /api/applications/:id/interview
// @desc    Invite candidate to interview
// @access  Private (Recruiter only)
router.post('/:id/interview', protect, authorize('recruiter'), inviteToInterview);

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Recruiter only)
router.get('/job/:jobId', protect, authorize('recruiter'), getApplicationsByJob);

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Private (Candidate or Recruiter)
router.get('/:id', protect, getApplicationById);

// @route   PATCH /api/applications/:id/status
// @desc    Update application status
// @access  Private (Recruiter only)
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
