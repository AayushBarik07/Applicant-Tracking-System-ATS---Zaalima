# AI-Powered Applicant Tracking System (ATS)

## Description
This is an AI-powered Applicant Tracking System (ATS) built for the Zaalima Internship Project 3. It helps parse and manage resumes efficiently using AI capabilities.

## Tech Stack
- **Frontend**: React.js, React Query, Material UI (MUI), Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **File Processing**: Multer, pdf-parse (local storage during development)
- **AI**: Google Gemini API
- **Email**: Nodemailer + Gmail SMTP

## Project Structure
- `/client`: React frontend application
- `/server`: Node.js backend application

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally

### Installation
1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application
1. Start the Backend:
   ```bash
   cd server
   npm run dev
   ```
   (Runs on http://localhost:5000)

2. Start the Frontend:
   ```bash
   cd client
   npm run dev
   ```
   (Runs on http://localhost:3000)

## Progress Report

### Day 1: Architecture Setup
- Initialized React/Vite frontend with Material UI and React Query.
- Initialized Node.js/Express backend with MongoDB connectivity.
- Established basic server health-check API and frontend connection verification.
- Configured environment variables and `.gitignore`.

### Day 2: Database Modeling
- Designed and implemented MongoDB data models using Mongoose.
- Created `User` schema for recruiters and candidates.
- Created `Job` schema for job postings.
- Created `Application` schema to handle resume paths, AI scores, and application tracking.
- Successfully linked models using ObjectId references.

### Day 3: JWT Authentication
- Installed `bcryptjs` and `jsonwebtoken` for secure user authentication.
- Created `authController` handling `/register`, `/login`, and `/me` endpoints.
- Implemented `protect` middleware to verify JWT tokens securely.
- Implemented role-based `authorize` middleware to restrict access to specific roles (recruiter vs candidate).
- Secured passwords using bcrypt hashing before saving to the database.
- Added environment variable validation for JWT signatures.

### Day 4: Frontend Authentication Integration
- Implemented `AuthContext` to manage global user state securely in React.
- Created `Login` and `Register` pages with form validation and error handling.
- Built a secure `ProtectedRoute` wrapper to prevent unauthenticated access.
- Managed JWT storage and added global Axios interceptors for authorized requests.

### Day 5: Recruiter Job APIs
- Developed RESTful API endpoints for Job Management (`GET`, `POST`, `PUT`, `PATCH`).
- Enforced role-based access so only authenticated recruiters can create and edit jobs.
- Implemented database-level verification to ensure recruiters can only modify their own postings.

### Day 6: Frontend Dashboards & Job Board
- Built the **Recruiter Dashboard** allowing recruiters to post, edit, and archive jobs.
- Created the public **Job Board** and **Job Details** page for candidates to browse active openings.
- Integrated `React Query` for optimal API data fetching and cache invalidation.

### Day 7: Integration & Bug Fixes
- Conducted full-flow end-to-end testing between Recruiter and Candidate roles.
- Fixed authorization bugs, React Query cache invalidation issues, and loading states.
- Cleaned up duplicated UI code and refined the Material-UI styling.

### Day 8: Secure Resume Uploads
- Integrated `multer` for secure, multipart/form-data file uploads on the backend.
- Enforced strict validation rules: PDF/DOCX formats only, maximum 5MB size.
- Auto-generated secure filenames to prevent traversal attacks.
- Built the frontend `ResumeUpload` component with loading states and error alerts.

### Day 9: Candidate Job Applications
- Developed the `POST /api/applications` backend API to seamlessly map uploaded resumes to active jobs.
- Added robust validation preventing candidates from applying to the same job twice or to inactive jobs.
- Upgraded the **Candidate Dashboard** to include a data table tracking the candidate's application history and current status.

### Day 10: Recruiter Application Tracking
- Built secure Recruiter APIs (`GET /api/applications/job/:jobId` and `PATCH /api/applications/:id/status`).
- Added strict authorization so recruiters can only view candidates who applied to their specific jobs.
- Created the **Job Applications Management Page** for recruiters.
- Implemented a dynamic Status Dropdown allowing recruiters to change candidate status (Applied, Interview, Offered, Rejected) with color-coded UI feedback.

### Day 11: Recruiter Application Pipeline
- Built a native drag-and-drop Kanban board interface for recruiters to manage application stages.
- Replaced the basic data table with visually distinct `Applied`, `Interview`, `Offered`, and `Rejected` columns.
- Implemented real-time React Query mutations so dragging a candidate's card instantly updates the backend status seamlessly.

### Day 12: PDF Resume Text Extraction
- Integrated the `pdf-parse` library into the backend to automatically parse uploaded resumes.
- Added background processing to extract all text from PDF documents the moment a candidate applies.
- Safely isolated the searchable extracted text in the database (`resumeText`) while keeping the physical files secure.
- Added graceful error handling for missing files, unreadable formats, and DOCX fallback.

### Day 13: Google Gemini AI Integration
- Created an isolated `geminiService` strictly confined to the backend to protect the API Key.
- Wrote strict, bias-free AI prompt instructions commanding Gemini 1.5 Flash to extract exactly 5 structured fields (Name, Skills, Experience, Education, Summary).
- Implemented JSON cleansing and parsing to reliably store the AI's extraction directly into the `Application` schema.

### Day 14: AI Candidate & Job Matching Engine
- Upgraded the `geminiService` with an intelligent evaluation prompt that directly compares the candidate's extracted data against the specific job's requirements.
- The AI now scores the candidate from 0-100, explicitly highlighting `matchedSkills` and `missingSkills`.
- Instructed the AI to strictly ignore all protected characteristics (gender, age, etc.) ensuring a completely fair, qualifications-based score.
- Added a secure endpoint (`POST /api/applications/:id/analyze`) for recruiters to manually trigger the analysis for any candidate.

### Day 15: Candidate Ranking & Filtering Dashboard
- Developed a comprehensive Candidate Ranking dashboard giving recruiters a top-down view of candidate fit.
- Implemented advanced client-side filtering: Filter by Minimum AI Score, current Application Status, and live text search through both extracted and AI-matched Skills.
- Implemented dynamic Sorting capabilities (Highest Score, Lowest Score, Newest Applications).
- Added an interactive UI toggle allowing recruiters to seamlessly switch between the drag-and-drop Pipeline Board and the AI Ranking Dashboard.
