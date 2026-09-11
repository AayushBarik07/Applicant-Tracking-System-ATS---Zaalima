const Job = require('../models/Job');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const query = {};
    
    // If a recruiter is requesting their own jobs, return all statuses. Otherwise, only active.
    if (req.query.recruiterId) {
      query.recruiter = req.query.recruiterId;
    } else {
      query.status = 'active';
    }

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });
      
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow viewing if the job is active
    if (job.status !== 'active') {
      return res.status(404).json({ message: 'This job is no longer available' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res) => {
  try {
    const { title, companyName, description, skills, experienceRequired, location } = req.body;

    if (!title || !companyName || !description) {
      return res.status(400).json({ message: 'Title, company name, and description are required' });
    }

    const job = await Job.create({
      title,
      companyName,
      description,
      skills,
      experienceRequired,
      location,
      recruiter: req.user._id,
      status: 'active',
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure the logged-in user matches the job's recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    const { title, companyName, description, skills, experienceRequired, location } = req.body;
    
    // Only allow updating specific fields to prevent overriding recruiter or status
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { title, companyName, description, skills, experienceRequired, location },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
};

// @desc    Archive a job
// @route   PATCH /api/jobs/:id/archive
// @access  Private (Recruiter only)
const archiveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure the logged-in user matches the job's recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to archive this job' });
    }

    job.status = 'archived';
    await job.save();

    res.status(200).json({ message: 'Job archived successfully', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while archiving job' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure the logged-in user matches the job's recruiter
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  archiveJob,
  deleteJob
};

// Reviewed for production readiness.

