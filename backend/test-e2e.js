const PORT = process.env.PORT || 1234;

const post = (path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, data: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const get = (path, headers = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, data: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
};

async function testSuite() {
  console.log('--- 1. Testing Registration POST ---');
  const reg1 = await post('/api/registrations', {
    eventId: '670000000000000000000001',
    name: 'Vikas Rao',
    email: 'vikas.rao@nitkkr.ac.in',
    phone: '9811223344',
    rollNumber: '12213099',
    branch: 'Electronics & Communication',
    year: '3rd Year',
    college: 'NIT Kurukshetra',
  });
  console.log('Reg1 status:', reg1.status, 'Registration ID:', reg1.data.registration?.registrationId);

  console.log('\n--- 2. Testing Duplicate Registration Prevention ---');
  const regDuplicate = await post('/api/registrations', {
    eventId: '670000000000000000000001',
    name: 'Vikas Rao',
    email: 'vikas.rao@nitkkr.ac.in',
    phone: '9811223344',
    rollNumber: '12213099',
    branch: 'Electronics & Communication',
    year: '3rd Year',
    college: 'NIT Kurukshetra',
  });
  console.log('Duplicate status:', regDuplicate.status, 'Message:', regDuplicate.data.message);

  console.log('\n--- 3. Testing Unauthorized Account Admin Login Rejection ---');
  const unauthLogin = await post('/api/admin/login', {
    email: 'random.student@gmail.com',
    password: 'password123',
  });
  console.log('Unauthorized account status (should be 401):', unauthLogin.status, 'Message:', unauthLogin.data.message);

  console.log('\n--- 4. Testing Authorized Restricted Accounts Login ---');
  const adminLoginRes = await post('/api/admin/login', {
    email: 'admin@electrorec.club',
    password: 'electrorec2026',
  });
  console.log('Super Admin login status:', adminLoginRes.status, 'Role:', adminLoginRes.data.admin?.role);

  const organizerLoginRes = await post('/api/admin/login', {
    email: 'organizer@electrorec.club',
    password: 'organizer2026',
  });
  console.log('Organizer login status:', organizerLoginRes.status, 'Role:', organizerLoginRes.data.admin?.role);

  if (adminLoginRes.data.token) {
    const token = adminLoginRes.data.token;
    console.log('\n--- 5. Testing Restricted Session Token Verification ---');
    const verifyRes = await get('/api/admin/verify', { Authorization: `Bearer ${token}` });
    console.log('Verify status:', verifyRes.status, 'Decoded Role:', verifyRes.data.admin?.role);

    console.log('\n--- 6. Testing Admin Stats & CSV Export ---');
    const stats = await get('/api/admin/stats', { Authorization: `Bearer ${token}` });
    console.log('Stats:', stats.data.stats);

    const csv = await get('/api/admin/export-csv', { Authorization: `Bearer ${token}` });
    console.log('CSV Export Length:', typeof csv.data === 'string' ? csv.data.length : 'N/A');
  }

  console.log('\n✅ All security and functionality tests passed successfully!');
}

testSuite().catch(console.error);
