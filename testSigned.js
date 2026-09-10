const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: 'server/.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const url = cloudinary.url('zaalima_resumes/425d976dc23072e8c27fa4966f87bc4a', { resource_type: 'image', format: 'pdf', sign_url: true });
console.log('Signed URL:', url);

async function test() {
  const res = await fetch(url);
  console.log('Status with signed URL:', res.status);
}
test();
