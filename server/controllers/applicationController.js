const Application = require('../models/Application');
const Job = require('../models/Job');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { analyzeResume, analyzeMatch } = require('../services/geminiService');
const { 
  sendApplicationReceivedEmail, 
  sendStatusChangedEmail, 
  sendInterviewInvitationEmail 
} = require('../services/emailService');

// @desc    Trigger AI analysis for an application against the job
// @route   POST /api/applications/:id/analyze
// @access  Private (Recruiter only)
const triggerAnalysis = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the recruiter owns the job
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to analyze this application' });
    }

    // Call Gemini API to evaluate match
    const matchAnalysis = await analyzeMatch(application, application.job);
    
    if (matchAnalysis) {
      application.aiScore = matchAnalysis.score;
      application.matchedSkills = matchAnalysis.matchedSkills || [];
      application.missingSkills = matchAnalysis.missingSkills || [];
      // we already have aiSummary from resume parsing, but let's append or overwrite with match summary
      application.aiSummary = matchAnalysis.summary || application.aiSummary;
      
      await application.save();
      return res.status(200).json({ message: 'Analysis completed successfully', application });
    } else {
      return res.status(500).json({ message: 'AI Analysis failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while triggering analysis' });
  }
};

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Candidate only)
// Note: This endpoint expects 'resume' as multipart/form-data, and 'jobId' in the body
const createApplication = async (req, res) => {
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
};
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title location status')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only)
const getApplicationsByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure the logged-in recruiter owns this job
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Candidate or Recruiter)
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('job', 'title recruiter');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Authorization: Candidate who applied, or Recruiter who owns the job
    const isCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();

    if (!isCandidate && !isRecruiter) {
      return res.status(401).json({ message: 'Not authorized to view this application' });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Interview', 'Offered', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id).populate('job').populate('candidate');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the recruiter owns the job
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Trigger email (non-blocking)
    if (application.candidate) {
      sendStatusChangedEmail(
        application.candidate.email, 
        application.candidate.name, 
        application.job.title, 
        status
      ).catch(err => console.error("Status email failed:", err));
    }

    res.status(200).json({ message: 'Status updated successfully', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating application status' });
  }
};

// @desc    Invite candidate to interview
// @route   POST /api/applications/:id/interview
// @access  Private (Recruiter only)
const inviteToInterview = async (req, res) => {
  try {
    const { date, time, message } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    const application = await Application.findById(req.params.id).populate('job').populate('candidate');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to invite this candidate' });
    }

    application.status = 'Interview';
    await application.save();

    // Trigger email (non-blocking)
    if (application.candidate) {
      sendInterviewInvitationEmail(
        application.candidate.email, 
        application.candidate.name, 
        application.job.title, 
        date, 
        time, 
        message || 'We would like to invite you for an interview.'
      ).catch(err => console.error("Interview email failed:", err));
    }

    res.status(200).json({ message: 'Interview invitation sent successfully', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while sending invitation' });
  }
};

// @desc    Candidate responds to interview
// @route   PATCH /api/applications/:id/interview-response
// @access  Private (Candidate only)
const respondToInterview = async (req, res) => {
  try {
    const { response } = req.body; // 'Accepted' or 'Declined'
    
    if (!['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response' });
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.candidateInterviewResponse = response;
    
    if (response === 'Declined') {
      application.status = 'Rejected';
    }

    await application.save();
    res.status(200).json({ message: `Interview ${response.toLowerCase()} successfully`, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing response' });
  }
};

// @desc    Candidate responds to offer
// @route   PATCH /api/applications/:id/offer-response
// @access  Private (Candidate only)
const respondToOffer = async (req, res) => {
  try {
    const { response } = req.body; // 'Accepted' or 'Declined'
    
    if (!['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response' });
    }

    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.candidateOfferResponse = response;
    
    if (response === 'Declined') {
      application.status = 'Rejected';
    }

    await application.save();
    res.status(200).json({ message: `Offer ${response.toLowerCase()} successfully`, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing response' });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
  triggerAnalysis,
  inviteToInterview,
  respondToInterview,
  respondToOffer
};

// Reviewed for production readiness.
