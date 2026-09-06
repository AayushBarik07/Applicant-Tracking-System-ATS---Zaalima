const { GoogleGenerativeAI } = require('@google/generative-ai');

const analyzeResume = async (resumeText) => {
  if (!resumeText || resumeText.startsWith('ERROR') || resumeText.startsWith('WARNING')) {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('Gemini API key is not configured.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using a fast model suitable for text processing
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert HR assistant. Analyze the following resume text and extract the key information into a structured JSON format.
      
      Requirements:
      1. Use ONLY information present in the resume. Do NOT invent or hallucinate information.
      2. Keep the responses concise.
      3. Return ONLY valid JSON, with no markdown formatting around it.
      
      Required JSON structure:
      {
        "candidateName": "Extracted full name, or empty string if not found",
        "skills": ["Array", "of", "extracted", "skills"],
        "experience": "A very brief 1-2 sentence summary of their work experience",
        "education": "A very brief summary of their highest education",
        "summary": "A 2-sentence professional summary based on the resume"
      }
      
      Resume Text:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting if the model still includes it
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    return null;
  }
};

const analyzeMatch = async (candidate, job) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('Gemini API key is not configured.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert HR recruitment assistant. Your task is to evaluate a candidate's fit for a specific job posting.
      
      Requirements:
      1. Evaluate ONLY against the provided job information and candidate information.
      2. Do NOT invent or hallucinate candidate skills or experiences.
      3. Do NOT make decisions based on gender, age, religion, race, or other protected characteristics. Focus PURELY on job-related qualifications.
      4. Return ONLY valid JSON, with no markdown formatting around it.
      
      Required JSON structure:
      {
        "score": 0-100 (a number representing how well the candidate matches the job),
        "matchedSkills": ["Array", "of", "skills", "found in BOTH candidate and job"],
        "missingSkills": ["Array", "of", "required", "skills", "NOT found in candidate"],
        "summary": "A concise 2-sentence summary explaining the score and the candidate's fit."
      }
      
      Candidate Data:
      Extracted Skills: ${candidate.extractedSkills ? candidate.extractedSkills.join(', ') : 'N/A'}
      Experience: ${candidate.experience || 'N/A'}
      Education: ${candidate.education || 'N/A'}
      Resume Summary: ${candidate.aiSummary || 'N/A'}
      
      Job Data:
      Title: ${job.title || 'N/A'}
      Description: ${job.description || 'N/A'}
      Required Skills: ${job.skills ? job.skills.join(', ') : 'N/A'}
      Required Experience: ${job.experienceRequired || 'N/A'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(text);
    
    // Ensure score is a number between 0 and 100
    if (typeof parsedData.score !== 'number') {
      parsedData.score = parseInt(parsedData.score) || 0;
    }
    parsedData.score = Math.max(0, Math.min(100, parsedData.score));

    return parsedData;
  } catch (error) {
    console.error('Error matching candidate with Gemini:', error);
    return null;
  }
};

module.exports = {
  analyzeResume,
  analyzeMatch
};
