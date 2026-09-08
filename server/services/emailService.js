const sendEmail = async (to, subject, html) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn(`[EmailJS Skipped] Credentials not configured. Would have sent: "${subject}" to ${to}`);
    return false;
  }

  const data = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: to,
      subject: subject,
      message: html,
    },
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log(`EmailJS: Email successfully sent to ${to}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`EmailJS Error sending to ${to}:`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`EmailJS Request failed to ${to}:`, error);
    return false;
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