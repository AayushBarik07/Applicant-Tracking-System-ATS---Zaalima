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

    // Return the S3 key or location to the file.
    // We store the S3 key in the database so we can generate presigned URLs later.
    const filePath = req.file.key; // multer-s3 provides the object key
    
    res.status(200).json({
      message: 'Resume uploaded successfully to S3',
      filePath: filePath,
    });
  });
});

module.exports = router;
