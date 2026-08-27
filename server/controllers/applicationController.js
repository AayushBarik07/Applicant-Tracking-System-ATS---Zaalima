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

    const application = await Application.create({
      candidate: req.user._id,
      job: jobId,
      resumePath: `/uploads/resumes/${req.file.filename}`,
      status: 'Applied',
    });

    // Background text extraction
    let extractedText = '';
    const filePath = req.file.path;

    if (req.file.mimetype === 'application/pdf') {
      try {
        if (fs.existsSync(filePath)) {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          extractedText = pdfData.text;
          
          if (!extractedText || extractedText.trim() === '') {
            extractedText = 'WARNING: PDF appears to be empty or unreadable (likely an image-based PDF).';
          }
        } else {
          extractedText = 'ERROR: File is missing from the server.';
        }
      } catch (parseError) {
        console.error('PDF parsing error:', parseError);
        extractedText = 'ERROR: Failed to parse PDF file.';
      }
    } else {
      extractedText = 'NOTE: Resume is a DOCX file. Text extraction is currently only supported for PDF files.';
    }

    application.resumeText = extractedText;

    // Call Gemini API to extract structured data
    const aiAnalysis = await analyzeResume(extractedText);
    
    if (aiAnalysis) {
      application.extractedSkills = aiAnalysis.skills || [];
      application.experience = aiAnalysis.experience || '';
      application.education = aiAnalysis.education || '';
      application.aiSummary = aiAnalysis.summary || '';
      // We don't have candidateName in the schema (the user is linked), but we parsed it.
      // aiScore isn't in this prompt, but can be added later.
    }

    await application.save();

    // Trigger email (non-blocking)
    sendApplicationReceivedEmail(req.user.email, req.user.name, job.title).catch(err => console.error("Email failed:", err));

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while applying for job' });
  }
};

// @desc    Get candidate's application history
// @route   GET /api/applications/my
// @access  Private (Candidate only)
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

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationsByJob,
  getApplicationById,
  updateApplicationStatus,
  triggerAnalysis,
  inviteToInterview
};
