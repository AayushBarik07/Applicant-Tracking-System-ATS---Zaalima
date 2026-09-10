const fs = require('fs');

let content = fs.readFileSync('server/controllers/applicationController.js', 'utf8');

const replacement = `const createApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'Cannot apply to an inactive job' });
    }

    // Check if candidate already applied
    const existingApplication = await Application.findOne({
      candidate: req.user._id,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Upload buffer to Cloudinary manually
    const cloudinary = require('cloudinary').v2;
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const ext = req.file.originalname.split('.').pop().toLowerCase();
        const resourceType = ext === 'pdf' ? 'image' : 'auto';
        
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'zaalima_resumes', resource_type: resourceType, format: ext },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to upload to Cloudinary' });
    }

    const cloudinaryUrl = cloudinaryResult.secure_url;

    const application = await Application.create({
      candidate: req.user._id,
      job: jobId,
      resumePath: cloudinaryUrl,
      status: 'Applied',
    });

    // Background text extraction using Node.js pdf-parse
    let extractedText = '';
    
    try {
      if (req.file.originalname.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } else {
        extractedText = 'WARNING: Only PDF files are fully parsed by AI currently.';
      }
    } catch (parseError) {
      console.error('Extraction flow error:', parseError);
      extractedText = 'ERROR: Failed to extract text from document.';
    }

    application.resumeText = extractedText;

    // Call Gemini API to extract structured data
    const aiAnalysis = await analyzeResume(extractedText);
    
    if (aiAnalysis) {
      application.extractedSkills = aiAnalysis.skills || [];
      application.experience = aiAnalysis.experience || '';
      application.education = aiAnalysis.education || '';
      application.aiSummary = aiAnalysis.summary || '';
    }

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};`;

content = content.replace(/const createApplication = async \(req, res\) => \{[\s\S]*?(?=\nconst getMyApplications)/, replacement);

fs.writeFileSync('server/controllers/applicationController.js', content);
