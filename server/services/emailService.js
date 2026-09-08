const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.warn(`[Email Service Skipped] Credentials not configured. Would have sent: "${subject}" to ${to}`);
    return false;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Zaalima ATS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false; // Return false but don't throw to prevent crashing
  }
};

const sendApplicationReceivedEmail = async (candidateEmail, candidateName, jobTitle) => {
  const subject = `Application Received: ${jobTitle}`;
  const html = `
    <h2>Hi ${candidateName},</h2>
    <p>We have successfully received your application for the <strong>${jobTitle}</strong> position.</p>
    <p>Our recruitment team will review your profile and get back to you soon.</p>
    <br/>
    <p>Best regards,</p>
    <p>The Recruitment Team</p>
  `;
  return await sendEmail(candidateEmail, subject, html);
};

const sendStatusChangedEmail = async (candidateEmail, candidateName, jobTitle, newStatus) => {
  const subject = `Application Update: ${jobTitle}`;
  const html = `
    <h2>Hi ${candidateName},</h2>
    <p>There is an update regarding your application for the <strong>${jobTitle}</strong> position.</p>
    <p>Your application status is now: <strong>${newStatus}</strong></p>
    <br/>
    <p>Best regards,</p>
    <p>The Recruitment Team</p>
  `;
  return await sendEmail(candidateEmail, subject, html);
};

const sendInterviewInvitationEmail = async (candidateEmail, candidateName, jobTitle, date, time, message) => {
  const subject = `Interview Invitation: ${jobTitle}`;
  const html = `
    <h2>Hi ${candidateName},</h2>
    <p>We are pleased to invite you to an interview for the <strong>${jobTitle}</strong> position!</p>
    
    <h3>Interview Details:</h3>
    <ul>
      <li><strong>Date:</strong> ${date}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>
    
    <h3>Message from the Recruiter:</h3>
    <p><em>${message}</em></p>
    
    <br/>
    <p>Looking forward to speaking with you!</p>
    <p>Best regards,</p>
    <p>The Recruitment Team</p>
  `;
  return await sendEmail(candidateEmail, subject, html);
};

module.exports = {
  sendApplicationReceivedEmail,
  sendStatusChangedEmail,
  sendInterviewInvitationEmail
};

// Reviewed for production readiness.
