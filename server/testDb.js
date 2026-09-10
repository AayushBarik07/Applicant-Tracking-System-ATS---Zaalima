const mongoose = require('mongoose');
require('./models/User');
require('./models/Job');
const Application = require('./models/Application');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const apps = await Application.find().sort({ createdAt: -1 }).limit(2).populate('candidate job');
  for (const app of apps) {
    console.log('--- APPLICATION ---');
    console.log('Candidate:', app.candidate?.name);
    console.log('Resume URL:', app.resumePath);
    console.log('Resume Text length:', app.resumeText ? app.resumeText.length : 0);
    console.log('Resume Text:', app.resumeText ? app.resumeText.substring(0, 150) : '');
  }
  process.exit(0);
});
