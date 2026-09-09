const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('client/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Carefully replace exact matches to avoid nested replacements
  content = content.replace(/'http:\/\/localhost:5000\/api/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '");
  content = content.replace(/"http:\/\/localhost:5000\/api/g, '(import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "');
  content = content.replace(/\http:\/\/localhost:5000\/api/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}");

  // For non-API routes like resumePath
  content = content.replace(/'http:\/\/localhost:5000/g, "(import.meta.env.VITE_BASE_URL || 'http://localhost:5000') + '");
  content = content.replace(/"http:\/\/localhost:5000/g, '(import.meta.env.VITE_BASE_URL || "http://localhost:5000") + "');
  content = content.replace(/\http:\/\/localhost:5000/g, "${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}");

  // Fix up trailing stuff from string concat logic
  content = content.replace(/\+ ''/g, "");
  content = content.replace(/\+ ""/g, "");

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed URLs safely!');
