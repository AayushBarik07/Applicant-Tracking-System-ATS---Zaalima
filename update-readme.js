const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf8');

// Update Day 15 to Day 16
const day16 = * **Day 15 (Interactive Workflows & UI Polish):** Implemented two-way interactive workflows allowing candidates to explicitly Accept/Decline interviews and offers from a redesigned modern dashboard. Overhauled the Recruiter Kanban Board with smart action buttons, detailed JD-based AI Breakdown dialogs, and a clean, user-friendly aesthetic.
* **Day 16 (Deployment & Email Integrations):** Deployed the application stack to production using Render (Node.js & Python Microservice) and Vercel (React Frontend) with dynamic environment variable routing. Replaced Nodemailer with the EmailJS REST API for reliable, secure, serverless email delivery of interview invitations and status updates.;
content = content.replace(/\* \*\*Day 15[\s\S]*?aesthetic\./, day16);

// Update Architecture
const architecture = ## System Architecture

The application follows a standard MERN stack architecture, enhanced with a Python Microservice and serverless integrations. The Node.js backend serves as the core API, enforcing role-based authorization. Heavy tasks (like PDF parsing and AI processing) are offloaded to external services to keep the main thread fast.

\\\mermaid
graph TD
    Client[React Frontend <br/>Hosted on Vercel] -->|REST API Calls| Node[Node.js Backend <br/>Hosted on Render]
    
    Node -->|Resume PDF URL| Python[Python Microservice <br/>Hosted on Render]
    Python -->|Extracted Plain Text| Node
    
    Node -->|Extracted Text + JD| Gemini[Google Gemini AI]
    Gemini -->|AI Match Score & JSON| Node
    
    Node -->|Upload Resume File| Cloudinary[Cloudinary Cloud Storage]
    Node <-->|Read/Write Data| Mongo[(MongoDB Atlas)]
    Node -->|Trigger Email Alerts| EmailJS[EmailJS API]
\\\
;
content = content.replace(/## Architecture[\s\S]*?## Environment Variables/, architecture + '\n## Environment Variables');

// Update Env Vars
const envVars = \\\env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.../ats_db
JWT_SECRET=your_super_secret_jwt_string_here
GEMINI_API_KEY=your_actual_google_gemini_api_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PYTHON_SERVICE_URL=http://localhost:5001/parse
\\\`;
content = content.replace(/\\\env[\s\S]*?\\\/, envVars);

fs.writeFileSync('README.md', content);
console.log('README updated!');
