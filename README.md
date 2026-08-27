# AI-Powered Applicant Tracking System (ATS)

## Project Overview
The Zaalima AI-Powered Applicant Tracking System (ATS) is an end-to-end recruitment platform designed to streamline the hiring process. Built for "Project 3" of the Zaalima Internship, this application empowers recruiters to manage job postings and candidates using a visual Kanban pipeline, while candidates can securely upload their resumes to apply. 

The core feature of this platform is the integration of **Google Gemini AI**, which automatically parses PDF resumes, extracts structured data (skills, experience, education), and evaluates candidates against job descriptions to provide recruiters with an intelligent, bias-free "Match Score".

## Day-Wise Progress Report

* **Day 1-3 (Database & Auth):** Designed the MongoDB schema structure for Users, Jobs, and Applications. Implemented secure JWT-based dual-role authentication (Recruiters vs. Candidates) and password hashing via `bcryptjs`.
* **Day 4-5 (Job Management):** Developed the Recruiter dashboard and core REST APIs to create, edit, view, and archive job postings securely.
* **Day 6-7 (Job Board & UI):** Built the public-facing Job Board and Candidate Dashboard using React and Material-UI, ensuring clean, responsive navigation.
* **Day 8-10 (Resume Uploads):** Configured secure file handling using `multer`. Allowed candidates to upload PDF/DOCX resumes (with a 5MB size limit) and submit applications directly linked to job listings.


## Features
1. **Secure Dual-Role Authentication:** Separate roles and capabilities for Recruiters and Candidates.
2. **Recruiter Portal:** Dashboard to create, edit, archive, and manage job postings.
3. **Candidate Portal:** Dashboard to track personal application history and statuses.
4. **Public Job Board:** A clean, accessible view of all active job openings.
5. **Secure Resume Upload:** File validation (PDF/DOCX, 5MB limit) and local storage integration.
6. **Application Pipeline (Kanban):** Interactive drag-and-drop board for recruiters to move candidates between stages (Applied, Interview, Offered, Rejected).


## Tech Stack
* **Frontend:** React.js, React Query, Material UI (MUI), Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose


## Architecture
The application follows a standard MERN (MongoDB, Express, React, Node) stack architecture. The backend serves as a RESTful API, enforcing strict role-based authorization for every endpoint. React Query acts as the data-fetching layer on the frontend, synchronizing server state and automatically invalidating caches (e.g., automatically refreshing the Kanban board when a candidate is moved).

## Folder Structure
```text
PROJECT-3/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (ResumeUpload, InterviewDialog, CandidateRanking)
│   │   ├── context/            # Global Auth Context
│   │   ├── pages/              # Main Views (Login, JobBoard, RecruiterDashboard, JobApplications)
│   │   ├── App.jsx             # React Router Setup
│   │   └── main.jsx            # React Query & Theme Providers
├── server/                     # Node.js Backend
│   ├── controllers/            # Business Logic (auth, job, application)
│   ├── middleware/             # Route Protectors (auth.js, uploadMiddleware.js)
│   ├── models/                 # Mongoose Schemas (User, Job, Application)
│   ├── routes/                 # Express API Definitions
│   ├── services/               # External Integrations (geminiService, emailService)
│   ├── tests/                  # Jest API Tests
│   ├── uploads/                # Local Resume Storage
│   └── server.js               # Application Entry Point
└── .env                        # Environment Variables (Root Level)
```

## Environment Variables
Create a `.env` file in the root `PROJECT-3/` directory containing the following:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ats_db
JWT_SECRET=your_super_secret_jwt_string_here
GEMINI_API_KEY=your_actual_google_gemini_api_key
EMAIL_USER=your_real_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_16_letter_google_app_password
```

## Local Setup & Run Instructions

### Prerequisites
* Node.js (v18+)
* MongoDB running locally (`mongod`)
* A Google Gemini API Key
* A Gmail account with an App Password generated (for SMTP)

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Run the Backend
```bash
cd server
npm run dev
# The backend will start on http://localhost:5000
```

### 3. Run the Frontend
```bash
cd client
npm run dev
# The frontend will start on http://localhost:5173 (or 3000)
```

## Workflows

### Resume Processing Flow
1. Candidate uploads a PDF resume (`multer` saves it securely to `/server/uploads/resumes/`).
2. Backend immediately opens the file and extracts raw text (`pdf-parse`).
3. Extracted text is sent to the Gemini AI Service.
4. Gemini returns structured JSON (skills, experience, education, summary).
5. The structured data is saved directly into the MongoDB `Application` document.

### AI Candidate Matching Flow
1. Recruiter clicks "Analyze AI" on a candidate's card.
2. The backend sends the Candidate's structured data AND the specific Job Description to Gemini.
3. Gemini evaluates the fit, ignoring protected characteristics.
4. Gemini returns an exact Score (0-100), lists of Matched/Missing skills, and a summary.
5. The backend saves the score, allowing the UI to rank and color-code the candidate.

### Email Notification Flow
1. Recruiter clicks "Invite" on a candidate card, selecting a Date, Time, and Message.
2. The UI sends a request to the backend.
3. The backend updates the Candidate's status to "Interview".
4. `emailService.js` constructs an HTML email and securely connects to Gmail SMTP.
5. The candidate instantly receives the invitation in their real inbox.

## API Overview
* `/api/auth` - Register, Login, Get Current User (`/me`).
* `/api/jobs` - CRUD operations for Job Postings.
* `/api/applications` - Submit resumes, fetch histories, and update Kanban statuses.
* `/api/applications/:id/analyze` - Trigger Gemini Match engine.
* `/api/applications/:id/interview` - Trigger Nodemailer Interview Invitation.

## Known Limitations
* **Local File Storage:** This system currently stores uploaded resumes directly on the local server file system (`/server/uploads`). In a true production environment, this will not scale across multiple server instances and runs the risk of data loss. AWS S3 (or a similar cloud bucket) should be implemented before enterprise deployment.
* **Paid Services Omitted:** No paid APIs were used per requirements. If volume scales, the free tier of the Gemini API may hit rate limits.
* **Basic Rate Limiting:** There is no strict API request throttling (`express-rate-limit`), meaning the server is theoretically susceptible to brute-force auth attempts.

## Future Improvements
* Migrate local file uploads to AWS S3.
* Add WebSockets for real-time Kanban board updates across multiple recruiters.
* Add in-memory testing environments (`mongodb-memory-server`) for deterministic CI/CD pipelines.
* Implement pagination for the Job Board and Applications Dashboard to handle massive data sets smoothly.
