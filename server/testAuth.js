const testAuth = async () => {
  const baseUrl = 'http://127.0.0.1:5000/api/auth';
  let candidateToken = '';
  let recruiterToken = '';

  const rand = Math.floor(Math.random() * 100000);
  const candidateEmail = `candidate${rand}@test.com`;
  const recruiterEmail = `recruiter${rand}@test.com`;

  try {
    console.log('1. Testing Registration (Candidate)...');
    let res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Candidate', email: candidateEmail, password: 'password123', role: 'candidate' })
    });
    let data = await res.json();
    if (res.ok) {
      console.log('✅ Registration successful. Token:', !!data.token);
      candidateToken = data.token;
    } else {
      console.log('❌ Registration failed:', data);
      return; // Stop tests if DB is down
    }

    console.log('\n2. Testing Duplicate Email...');
    res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Candidate 2', email: candidateEmail, password: 'password123', role: 'candidate' })
    });
    data = await res.json();
    console.log(res.status === 400 ? '✅ Duplicate email rejected' : '❌ Duplicate email failed');

    console.log('\n3. Testing Registration (Recruiter)...');
    res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Recruiter', email: recruiterEmail, password: 'password123', role: 'recruiter' })
    });
    data = await res.json();
    recruiterToken = data.token;
    console.log(res.ok ? '✅ Recruiter registered' : '❌ Recruiter failed');

    console.log('\n4. Testing Login...');
    res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password: 'password123' })
    });
    data = await res.json();
    console.log(res.ok ? '✅ Login successful' : '❌ Login failed');

    console.log('\n5. Testing Wrong Password...');
    res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail, password: 'wrongpassword' })
    });
    console.log(res.status === 401 ? '✅ Wrong password rejected' : '❌ Wrong password failed');

    console.log('\n6. Testing Protected Endpoint without Token...');
    res = await fetch(`${baseUrl}/me`);
    console.log(res.status === 401 ? '✅ Unauthenticated request rejected' : '❌ Unauthenticated request failed');

    console.log('\n7. Testing Protected Endpoint with Token (/me)...');
    res = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    data = await res.json();
    console.log(res.ok && data.email === candidateEmail ? '✅ /me endpoint works' : '❌ /me endpoint failed');

    console.log('\n8. Testing Recruiter-Only Access with Candidate Token...');
    res = await fetch(`${baseUrl}/recruiter-only`, {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    console.log(res.status === 403 ? '✅ Candidate blocked from recruiter route' : '❌ Candidate accessed recruiter route');

    console.log('\n9. Testing Recruiter-Only Access with Recruiter Token...');
    res = await fetch(`${baseUrl}/recruiter-only`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    console.log(res.ok ? '✅ Recruiter accessed recruiter route' : '❌ Recruiter blocked');

    console.log('\n10. Testing Candidate-Only Access with Recruiter Token...');
    res = await fetch(`${baseUrl}/candidate-only`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    console.log(res.status === 403 ? '✅ Recruiter blocked from candidate route' : '❌ Recruiter accessed candidate route');

  } catch (err) {
    console.error('Test execution error:', err);
  }
};

testAuth();
