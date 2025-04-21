import * as fs from 'fs';

interface ExtractedCandidateInfo {
  name?: string;
  email?: string;
  phone?: string;
  degree?: string;
  degreeField?: string;
  yearsExperience?: number;
  hasCertifications?: boolean;
  certifications?: string;
  nativeEnglishSpeaker?: boolean;
  militaryExperience?: boolean;
  resumeUrl?: string;
  status?: string;
}

/**
 * Enhanced text pattern analysis for extracting candidate information from resume text
 * without requiring external AI APIs
 */
export async function extractCandidateInfoFromText(
  text: string,
  filePath?: string
): Promise<ExtractedCandidateInfo> {
  console.log("Using enhanced text pattern analysis...");
  
  // Normalize text - remove extra spaces, convert to lowercase for case-insensitive matching
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const lowercaseText = normalizedText.toLowerCase();
  
  const result: ExtractedCandidateInfo = {
    status: "new"
  };
  
  // Extract basic information using enhanced regex patterns
  
  // 1. Extract email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = normalizedText.match(emailRegex) || [];
  if (emails.length > 0) {
    result.email = emails[0]; // Take the first email found
  }
  
  // 2. Extract phone numbers with various formats
  const phoneRegexList = [
    /(?:\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, // (123) 456-7890, 123-456-7890
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Basic 10-digit formats
    /\b\+\d{1,3}\s?\d{9,15}\b/g // International format
  ];
  
  for (const regex of phoneRegexList) {
    const phones = normalizedText.match(regex) || [];
    if (phones.length > 0) {
      result.phone = phones[0];
      break;
    }
  }
  
  // 3. Extract full name (more comprehensive)
  // Try to find name patterns near common resume headers
  const namePatterns = [
    /(?:name|full name|candidate)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/m, // Name at the beginning of a line (often at top of resume)
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\n.*?(?:email|phone|address)/i, // Name followed by contact info
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g // General pattern for names
  ];
  
  for (const pattern of namePatterns) {
    const match = pattern.exec(normalizedText);
    if (match && match[1]) {
      result.name = match[1].trim();
      break;
    }
  }
  
  // Fallback if previous patterns don't find a name
  if (!result.name) {
    const names = normalizedText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
    if (names.length > 0) {
      // Prefer names near the top of the document
      const firstFewLines = normalizedText.split('\n').slice(0, 5).join(' ');
      const namesInFirstLines = firstFewLines.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
      
      if (namesInFirstLines.length > 0) {
        result.name = namesInFirstLines[0];
      } else {
        result.name = names[0];
      }
    }
  }
  
  // 4. Extract education information
  // Look for degree patterns
  const degreePatterns = [
    { 
      regex: /(?:bachelor|bachelor['']?s|b\.?a\.?|b\.?s\.?|undergraduate)/i, 
      value: "Bachelor" 
    },
    { 
      regex: /(?:master|master['']?s|m\.?a\.?|m\.?s\.?|m\.?b\.?a\.?|graduate)/i, 
      value: "Master" 
    },
    { 
      regex: /(?:ph\.?d\.?|doctor|doctorate|d\.?phil\.?)/i, 
      value: "PhD" 
    },
    { 
      regex: /(?:associate['']?s|a\.?a\.?|a\.?s\.?)/i, 
      value: "Associate" 
    },
    { 
      regex: /(?:high school|secondary|diploma)/i, 
      value: "High School" 
    }
  ];
  
  // First try to find degree in education sections
  const educationSectionRegex = /\b(?:education|academic|qualification|degree)\b.*?(?:\n\n|\n\w+:)/is;
  const educationSection = educationSectionRegex.exec(normalizedText);
  
  if (educationSection) {
    const educationText = educationSection[0];
    
    for (const pattern of degreePatterns) {
      if (pattern.regex.test(educationText)) {
        result.degree = pattern.value;
        break;
      }
    }
  }
  
  // If not found in education section, check the entire document
  if (!result.degree) {
    for (const pattern of degreePatterns) {
      if (pattern.regex.test(lowercaseText)) {
        result.degree = pattern.value;
        break;
      }
    }
  }
  
  // 5. Extract degree field or major
  const fieldPatterns = [
    /(?:degree|major|concentration|specialization) (?:in|:)?\s+([A-Za-z][A-Za-z\s]+?)(?:\.|\n|,|from)/i,
    /(?:bachelor|master|phd|doctorate|b\.a\.|b\.s\.|m\.a\.|m\.s\.|m\.b\.a\.) (?:in|of|:)?\s+([A-Za-z][A-Za-z\s]+?)(?:\.|\n|,|from)/i
  ];
  
  for (const pattern of fieldPatterns) {
    const match = pattern.exec(normalizedText);
    if (match && match[1]) {
      result.degreeField = match[1].trim();
      break;
    }
  }
  
  // Common fields for ELT instructors
  const commonFields = [
    { regex: /\b(?:english|tesl|tesol|linguistics|language teaching)\b/i, value: "English" },
    { regex: /\b(?:literature|literary studies)\b/i, value: "Literature" },
    { regex: /\b(?:education|teaching|instructional design)\b/i, value: "Education" },
    { regex: /\b(?:applied linguistics|language acquisition)\b/i, value: "Linguistics" }
  ];
  
  if (!result.degreeField) {
    for (const field of commonFields) {
      if (field.regex.test(lowercaseText)) {
        result.degreeField = field.value;
        break;
      }
    }
  }
  
  // 6. Extract years of experience
  const experiencePatterns = [
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|work experience|teaching experience)/i,
    /experience\D*(\d+)\+?\s*(?:years?|yrs?)/i,
    /(?:professional|work|industry)\s+experience\D*(\d+)\+?\s*(?:years?|yrs?)/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = pattern.exec(normalizedText);
    if (match && match[1]) {
      const years = parseInt(match[1], 10);
      if (!isNaN(years) && years > 0 && years < 50) { // Sanity check
        result.yearsExperience = years;
        break;
      }
    }
  }
  
  // 7. Check for certifications
  const certificationPatterns = [
    /\b(?:tefl|tesol|celta|delta|teaching certification)\b/i,
    /\bcertified\s+(?:english|language|esl|esol)\s+teacher\b/i,
    /\bcertificate\s+in\s+(?:english|language|teaching|tesol|tefl)\b/i
  ];
  
  let certificationText = "";
  let hasCertifications = false;
  
  for (const pattern of certificationPatterns) {
    if (pattern.test(normalizedText)) {
      hasCertifications = true;
      
      // Try to extract the full certification context
      const match = normalizedText.match(new RegExp(`.{0,50}${pattern.source}.{0,50}`, 'i'));
      if (match) {
        certificationText += match[0].trim() + "; ";
      }
    }
  }
  
  if (hasCertifications) {
    result.hasCertifications = true;
    if (certificationText) {
      result.certifications = certificationText.trim();
    } else {
      result.certifications = "TEFL/TESOL/CELTA certification mentioned";
    }
  }
  
  // 8. Check for native English speaker status
  const nativeEnglishPatterns = [
    /\bnative\s+(?:english|language)\s+speaker\b/i,
    /\benglish\s+(?:native|mother)\s+(?:speaker|tongue)\b/i,
    /\bfirst\s+language:?\s+english\b/i,
    /\bl1:?\s+english\b/i
  ];
  
  for (const pattern of nativeEnglishPatterns) {
    if (pattern.test(normalizedText)) {
      result.nativeEnglishSpeaker = true;
      break;
    }
  }
  
  // 9. Check for military experience
  const militaryPatterns = [
    /\b(?:military|army|navy|air force|marine|marines|coast guard|armed forces|national guard|defense force)\b/i,
    /\bveteran\b/i,
    /\bserved\s+(?:in|with)\s+(?:the|)\s*(?:military|army|navy|air force|marine|marines|armed forces)\b/i
  ];
  
  for (const pattern of militaryPatterns) {
    if (pattern.test(normalizedText)) {
      result.militaryExperience = true;
      break;
    }
  }
  
  console.log("Extracted candidate info using text pattern analysis:", result);
  return result;
}

/**
 * Extract text from a file path, handling different file types
 */
export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return "";
    }
    
    // Determine file type based on extension
    const extension = filePath.toLowerCase().split('.').pop() || '';
    
    if (extension === 'pdf') {
      try {
        // Try to use pdf-parse if available
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text || "";
      } catch (pdfError) {
        console.error("Error using pdf-parse:", pdfError);
        // If pdf-parse fails, fall back to reading as text
        return fs.readFileSync(filePath, 'utf8');
      }
    } else if (['doc', 'docx'].includes(extension)) {
      // Basic handling for Word documents (reads as text, may have encoding issues)
      return fs.readFileSync(filePath, 'utf8');
    } else if (['txt', 'md', 'rtf'].includes(extension)) {
      // Text files
      return fs.readFileSync(filePath, 'utf8');
    } else {
      // Unknown file type, try as text
      console.warn(`Unknown file extension: ${extension}, trying to read as text`);
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "";
  }
}