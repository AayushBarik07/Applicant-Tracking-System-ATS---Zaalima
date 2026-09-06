const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/auth');

// @desc    Upload candidate resume
// @route   POST /api/upload/resume
// @access  Private (Candidate only)
router.post('/resume', protect, authorize('candidate'), (req, res) => {
  // Use multer upload middleware, expecting a single file field named 'resume'
  upload.single('resume')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the Cloudinary URL to the file.
    // Cloudinary stores the public URL in req.file.path
    const filePath = req.file.path;
    
    res.status(200).json({
      message: 'Resume uploaded successfully to Cloudinary',
      filePath: filePath,
    });
  });
});

module.exports = router;
