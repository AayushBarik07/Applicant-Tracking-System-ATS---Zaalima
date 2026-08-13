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
