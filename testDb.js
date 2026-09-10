const mongoose = require('mongoose');
const Application = require('./server/models/Application');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const apps = await Application.find().sort({ createdAt: -1 }).limit(1).populate('candidate job');
  if (apps.length > 0) {
    console.log('--- LATEST APPLICATION ---');
    console.log('Candidate:', apps[0].candidate?.name);
    console.log('Job:', apps[0].job?.title);
    console.log('Resume Text length:', apps[0].resumeText ? apps[0].resumeText.length : 0);
    console.log('Extracted Skills:', apps[0].extractedSkills);
    console.log('Experience:', apps[0].experience);
    console.log('Education:', apps[0].education);
    console.log('AI Summary:', apps[0].aiSummary);
  } else {
    console.log('No applications found.');
  }
  process.exit(0);
});
