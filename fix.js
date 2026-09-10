const fs = require('fs');

// RECRUITER
let rec = fs.readFileSync('client/src/pages/RecruiterDashboard.jsx', 'utf8');
rec = rec.replace(
  /<Container sx=\{\{ mt: 4 \}\}>\s*<Box sx=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 \}\}>\s*<Typography variant="h4">My Jobs<\/Typography>/,
  `<Container sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">My Jobs</Typography>`
);
fs.writeFileSync('client/src/pages/RecruiterDashboard.jsx', rec);

// CANDIDATE
let can = fs.readFileSync('client/src/pages/CandidateDashboard.jsx', 'utf8');

if (!can.includes('useAuth')) {
  can = can.replace(
    `import { useNavigate } from 'react-router-dom';`,
    `import { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';`
  );
  can = can.replace(
    `const navigate = useNavigate();`,
    `const navigate = useNavigate();\n  const { user } = useAuth();`
  );
}

can = can.replace(
  /<Box sx=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 \}\}>\s*<Typography variant="h3" sx=\{\{ fontWeight: 'bold', color: 'primary\.main' \}\}>\s*My Applications\s*<\/Typography>/,
  `<Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            My Applications
          </Typography>`
);

// We need to add the closing </Box> for the new wrapping Box
can = can.replace(
  /Browse Open Jobs\s*<\/Button>\s*<\/Box>/,
  `Browse Open Jobs\n        </Button>\n      </Box>\n      </Box>`
);

fs.writeFileSync('client/src/pages/CandidateDashboard.jsx', can);
