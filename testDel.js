async function testDelete() {
  try {
    const res = await fetch('https://applicant-tracking-system-ats-zaalima-1.onrender.com/api/jobs/6aa6a82898194cf6ae694e93', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
testDelete();
