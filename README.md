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
