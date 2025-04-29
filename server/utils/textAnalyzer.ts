import * as fs from 'fs';
import * as path from 'path';

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
  
  // 2. Extract phone numbers with various formats - improved with more formats
  const phoneRegexList = [
    // North American formats
    /(?:\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, // (123) 456-7890, 123-456-7890
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Basic 10-digit formats like 123-456-7890
    
    // International formats
    /\b\+\d{1,3}\s?\d{9,15}\b/g, // +1 1234567890, +123 123456789
    /\b\+\d{1,3}\s?\(\d{1,5}\)\s?\d{5,12}\b/g, // +1 (123) 456-7890
    
    // Common formats with country/area codes
    /\b(?:\+|00)\s?\d{1,3}\s?[-.]?\s?\d{1,5}\s?[-.]?\s?\d{3,10}\b/g, // +1.123.456.7890, 00 44 1234 567890
    
    // Look for phone/tel/mobile labels in the document followed by numbers
    /(?:phone|tel|telephone|mobile|cell)(?::|number|\s)+([+0-9()\s.-]{7,25})/i,
    
    // European/Asian formats with spaces
    /\b\d{2,4}\s\d{2,4}\s\d{2,4}(?:\s\d{2,4})?\b/g  // 12 3456 7890, 1234 5678 9012
  ];
  
  // First check for phone label followed by a number
  const phoneWithLabelMatch = normalizedText.match(/(?:phone|tel|telephone|mobile|cell)(?::|number|\s)+([+0-9()\s.-]{7,25})/i);
  if (phoneWithLabelMatch && phoneWithLabelMatch[1]) {
    // Clean up the extracted phone number
    result.phone = phoneWithLabelMatch[1].trim()
      .replace(/\s+/g, ' ')  // normalize spaces
      .replace(/^[-.\s]+|[-.\s]+$/g, ''); // trim leading/trailing separators
  } else {
    // If no labeled phone number found, try the regex patterns
    for (const regex of phoneRegexList) {
      const phones = normalizedText.match(regex) || [];
      if (phones.length > 0) {
        // Filter out numbers that are likely not phone numbers (too short, all zeros, etc.)
        const validPhones = phones.filter(phone => {
          const digitsOnly = phone.replace(/\D/g, '');
          return digitsOnly.length >= 7 && // Must have at least 7 digits
                !/^0+$/.test(digitsOnly) && // Not all zeros
                !/^1{7,}$/.test(digitsOnly); // Not all ones
        });
        
        if (validPhones.length > 0) {
          result.phone = validPhones[0];
          break;
        }
      }
    }
  }
  
  // Format the phone number if found
  if (result.phone) {
    // Clean up formatting
    result.phone = result.phone.trim()
      .replace(/\s+/g, ' ') // normalize spaces
      .replace(/^[-.\s]+|[-.\s]+$/g, ''); // trim leading/trailing separators
  }
  
  // 3. Extract full name (more comprehensive, improved for better matching)
  
  // Check for resume filename first - often contains the candidate's name
  if (filePath) {
    const filename = path.basename(filePath);
    // Extract potential name from filename (e.g., JohnDoe.pdf, Resume_Jane_Smith.pdf, Resume202504170332.pdf)
    
    // Special case for date-based filenames like Resume202504170332.pdf
    // Check if the filename contains a date pattern
    if (!filename.match(/Resume\d{12}/i)) {
      // Only try to extract from filename if it's not a date-based filename
      const filenameMatch = filename.match(/(?:Resume[_-]?)?([A-Za-z]+[_\s-]?[A-Za-z]+)(?:\.|_)/i);
      if (filenameMatch && filenameMatch[1]) {
        // Format the filename by replacing underscores and hyphens with spaces
        const potentialName = filenameMatch[1]
          .replace(/[_-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
          .trim();
        
        // Only use if it looks like a real name (at least two parts, proper capitalization)
        const nameParts = potentialName.split(/\s+/);
        if (nameParts.length >= 2) {
          // Properly capitalize each part of the name
          const formattedName = nameParts
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
          result.name = formattedName;
        }
      }
    } else {
      console.log("Date-based filename detected, skipping filename-based name extraction");
    }
  }
  
  // More sophisticated patterns for finding names in the text content
  if (!result.name) {
    // Look for contact/personal information section first
    const contactSectionHeaders = ["personal information", "contact", "contact information", "personal details", "personal data"];
    let contactSection = "";
    
    // Try to find a contact information section
    for (const header of contactSectionHeaders) {
      const headerIndex = lowercaseText.indexOf(header);
      if (headerIndex !== -1) {
        // Extract ~300 characters after the contact header
        contactSection = normalizedText.substring(headerIndex, headerIndex + 300);
        break;
      }
    }
    
    // Special patterns for name in contact section
    if (contactSection) {
      // Common patterns in contact sections
      const contactNamePatterns = [
        /name\s*[:\|]\s*([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})/i,
        /full\s+name\s*[:\|]\s*([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})/i
      ];
      
      for (const pattern of contactNamePatterns) {
        const match = pattern.exec(contactSection);
        if (match && match[1]) {
          const possibleName = match[1].trim();
          if (possibleName.length > 3 && possibleName.split(/\s+/).length >= 2) {
            result.name = possibleName;
            break;
          }
        }
      }
    }
    
    // If no name found in contact section, try other patterns
    if (!result.name) {
      // Try to find name patterns near common resume headers
      const namePatterns = [
        /(?:curriculum\s+vitae|resume)\s+(?:of|for|by)\s+([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})/i,
        /(?:name|full name|candidate)[:\s|]+([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})/i,
        /^([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})\s*$/m, // Name alone on a line
        /^([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})\s*\n/m, // Name at beginning of document
        /([A-Z][a-z]+(?:\s+[A-Za-z][a-z'\-]+){1,3})\s*\n.*?(?:email|phone|address|contact)/i, // Name followed by contact info
        /\b((?:[A-Z][a-z]{1,20}\s){1,2}[A-Z][a-z]{2,20})\b/, // General pattern for typical names
        
        // Look specifically near the extracted email address if available
        ...(result.email ? [
          new RegExp(`([A-Z][a-z]+(?:\\s+[A-Za-z][a-z'\\-]+){1,3})\\s*(?:\\n|,|\\|)\\s*${result.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
          new RegExp(`${result.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(?:\\n|,|\\|)\\s*([A-Z][a-z]+(?:\\s+[A-Za-z][a-z'\\-]+){1,3})`, 'i')
        ] : [])
      ];
      
      // First priority: Check the first 10 lines of the document
      const firstLines = normalizedText.split('\n').slice(0, 10).join('\n');
      
      for (const pattern of namePatterns) {
        const match = pattern.exec(firstLines);
        if (match && match[1]) {
          const possibleName = match[1].trim();
          // Additional validation: ensure it's not a title, header, or too short
          if (possibleName.length > 3 && 
              !/resume|curriculum|vitae|contact|profile/i.test(possibleName) &&
              possibleName.split(/\s+/).length >= 2) {
            result.name = possibleName;
            break;
          }
        }
      }
      
      // Fallback: search the entire document
      if (!result.name) {
        for (const pattern of namePatterns) {
          const match = pattern.exec(normalizedText);
          if (match && match[1]) {
            const possibleName = match[1].trim();
            if (possibleName.length > 3 && 
                !/resume|curriculum|vitae|contact|profile/i.test(possibleName) &&
                possibleName.split(/\s+/).length >= 2) {
              result.name = possibleName;
              break;
            }
          }
        }
      }
    }
    
    // Last resort: extract any capitalized words that look like names
    if (!result.name) {
      // Scan the first 400 characters for potential names (common location at top of resume)
      const topSection = normalizedText.substring(0, 400);
      const potentialNames = topSection.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
      
      if (potentialNames.length > 0) {
        // Filter out common non-name capitalized phrases
        const filteredNames = potentialNames.filter(name => 
          !/resume|curriculum|vitae|education|contact|profile|experience|objective|summary|university|college/i.test(name) &&
          name.split(/\s+/).length >= 2
        );
        
        if (filteredNames.length > 0) {
          result.name = filteredNames[0];
        } else {
          result.name = potentialNames[0]; // Use first match if no filtered matches
        }
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
  // Use a simplified approach without dotAll flag
  let educationSection = null;
  const educationHeaders = ["education", "academic", "qualification", "degree"];
  
  // Look for education sections by finding headers and then extracting content
  for (const header of educationHeaders) {
    const headerRegex = new RegExp(`\\b${header}\\b.*?\\n`, 'i');
    const match = headerRegex.exec(normalizedText);
    if (match) {
      // Get the next ~200 characters after the education header
      const startPos = match.index;
      const sectionText = normalizedText.substring(startPos, startPos + 200);
      educationSection = [sectionText];
      break;
    }
  }
  
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
    console.log(`Attempting to extract text from file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return "";
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    console.log(`File size: ${Math.round(stats.size / 1024)} KB`);
    
    if (stats.size === 0) {
      console.error('File is empty');
      return "";
    }
    
    // Determine file type based on extension
    const extension = filePath.toLowerCase().split('.').pop() || '';
    console.log(`File extension detected: ${extension}`);
    
    let extractedText = "";
    
    if (extension === 'pdf') {
      try {
        console.log('Using pdf-parse for PDF extraction');
        // Try to use pdf-parse for PDF files
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        
        extractedText = pdfData.text || "";
        console.log(`PDF text extraction successful. Extracted ${extractedText.length} characters`);
        
        if (extractedText.length < 50) {
          console.warn('PDF extraction returned very little text. Trying alternative method...');
          // Additional extraction methods could be added here in the future
        }
      } catch (pdfError) {
        console.error("Error using pdf-parse:", pdfError);
        console.log('Falling back to basic text extraction for PDF');
        try {
          // Try basic binary to text conversion as fallback
          extractedText = fs.readFileSync(filePath, 'utf8');
        } catch (readError) {
          console.error('Fallback text extraction also failed:', readError);
        }
      }
    } else if (['doc', 'docx'].includes(extension)) {
      console.log('Attempting to extract text from Word document');
      // Basic handling for Word documents (reads as text, may have encoding issues)
      try {
        extractedText = fs.readFileSync(filePath, 'utf8');
        console.log(`Extracted ${extractedText.length} characters from Word document`);
      } catch (docError) {
        console.error('Error extracting text from Word document:', docError);
      }
    } else if (['txt', 'md', 'rtf'].includes(extension)) {
      console.log(`Extracting text from ${extension} file`);
      // Text files
      extractedText = fs.readFileSync(filePath, 'utf8');
      console.log(`Extracted ${extractedText.length} characters from text file`);
    } else {
      // Unknown file type, try as text
      console.warn(`Unknown file extension: ${extension}, trying to read as text`);
      try {
        extractedText = fs.readFileSync(filePath, 'utf8');
        console.log(`Extracted ${extractedText.length} characters from unknown file type`);
      } catch (unknownError) {
        console.error('Error extracting text from unknown file type:', unknownError);
      }
    }
    
    // Log the first 100 characters of extracted text for debugging
    if (extractedText.length > 0) {
      console.log(`Text extraction preview: ${extractedText.substring(0, 100)}...`);
    } else {
      console.warn('No text was extracted from the file');
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "";
  }
}