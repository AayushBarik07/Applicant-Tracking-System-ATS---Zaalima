const fs = require('fs');

let can = fs.readFileSync('client/src/pages/CandidateDashboard.jsx', 'utf8');

// Fix emojis
can = can.replace(
  /\{app\.candidateInterviewResponse === 'Accepted' \? '[^']*' : '[^']*'\}/g, 
  `{app.candidateInterviewResponse === 'Accepted' ? 'Interview Accepted' : 'Interview Declined'}`
);
can = can.replace(
  /\{app\.candidateOfferResponse === 'Accepted' \? '[^']*' : '[^']*'\}/g, 
  `{app.candidateOfferResponse === 'Accepted' ? 'Offer Accepted' : 'Offer Declined'}`
);
can = can.replace(
  /color=\{app\.candidateInterviewResponse === 'Accepted' \? '[^']*' : '[^']*'\}/g, 
  `color={app.candidateInterviewResponse === 'Accepted' ? 'success.main' : 'error.main'}`
);
can = can.replace(
  /color=\{app\.candidateOfferResponse === 'Accepted' \? '[^']*' : '[^']*'\}/g, 
  `color={app.candidateOfferResponse === 'Accepted' ? 'success.main' : 'error.main'}`
);
can = can.replace(
  /.*\{app\.job\?\.location \|\| 'Remote'\} \| Applied on/g, 
  `                      Location: {app.job?.location || 'Remote'} | Applied on`
);

// Inject useAuth
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

// Inject Welcome
can = can.replace(
  /<Box sx=\{\{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 \}\}>/,
  `<Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>`
);

can = can.replace(
  /Browse Open Jobs\s*<\/Button>\s*<\/Box>/,
  `Browse Open Jobs\n        </Button>\n      </Box>\n      </Box>`
);

fs.writeFileSync('client/src/pages/CandidateDashboard.jsx', can);
