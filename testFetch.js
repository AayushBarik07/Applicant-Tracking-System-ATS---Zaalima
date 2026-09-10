async function test() {
  const url = 'https://res.cloudinary.com/x9vzqtwj/image/upload/v1789067537/zaalima_resumes/425d976dc23072e8c27fa4966f87bc4a.pdf';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const buf = await res.arrayBuffer();
    console.log('Size:', buf.byteLength);
  } catch(e) {
    console.error(e);
  }
}
test();
