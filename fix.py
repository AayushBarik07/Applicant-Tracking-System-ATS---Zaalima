import re

with open('client/src/pages/CandidateDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"\{app\.candidateInterviewResponse === 'Accepted' \? '\?* Interview Accepted' : '\?* Interview Declined'\}", 
                 r"{app.candidateInterviewResponse === 'Accepted' ? 'Interview Accepted' : 'Interview Declined'}", 
                 content)

content = re.sub(r"\{app\.candidateOfferResponse === 'Accepted' \? '\?\?* Offer Accepted!' : '\?* Offer Declined'\}", 
                 r"{app.candidateOfferResponse === 'Accepted' ? 'Offer Accepted' : 'Offer Declined'}", 
                 content)

content = re.sub(r"color=\{app\.candidateInterviewResponse === 'Accepted' \? '\?* Interview Accepted' : '\?* Interview Declined'\}",
                 r"color={app.candidateInterviewResponse === 'Accepted' ? 'success.main' : 'error.main'}",
                 content)

content = re.sub(r"color=\{app\.candidateOfferResponse === 'Accepted' \? '\?\?* Offer Accepted!' : '\?* Offer Declined'\}",
                 r"color={app.candidateOfferResponse === 'Accepted' ? 'success.main' : 'error.main'}",
                 content)

content = re.sub(r"dY"\? \{app\.job\?\.location \|\| 'Remote'\} \| Applied on",
                 r"Location: {app.job?.location || 'Remote'} | Applied on",
                 content)
                 
content = re.sub(r"\?\?* \{app\.job\?\.location \|\| 'Remote'\} \| Applied on",
                 r"Location: {app.job?.location || 'Remote'} | Applied on",
                 content)

with open('client/src/pages/CandidateDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
