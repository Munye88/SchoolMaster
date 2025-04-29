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
  nationality?: string;
  [key: string]: any; // Add index signature to allow string indexing
}

/**
 * Advanced text pattern analysis for extracting candidate information from resume text
 * with improved pattern recognition for better extraction accuracy
 */
export async function extractCandidateInfoFromResume(
  text: string,
  filePath?: string
): Promise<ExtractedCandidateInfo> {
  try {
    console.log('Using advanced text pattern analysis...');
    
    const result: ExtractedCandidateInfo = {
      status: 'new'
    };

    // Clean text for better detection
    // Remove binary or irregular characters often found in Word docs
    let cleanText = text.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\xFF]/g, ' ');
    // Normalize whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    const lowercaseText = cleanText.toLowerCase();
    
    // First, try to extract email addresses using regex pattern
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = cleanText.match(emailRegex) || [];
    if (emails.length > 0) {
      result.email = emails[0];
    }

    // Extract phone numbers - several formats
    const phoneRegexes = [
      /(?:\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g, // +1 (123) 456-7890
      /\d{5}[ -]?\d{6}/g, // 12345 123456
      /\d{4}[ -]?\d{7}/g, // 1234 1234567
      /\d{10}/g, // 1234567890
      /\d{3}[- ]?\d{3}[- ]?\d{4}/g, // 123-456-7890
      /\(\d{3}\)[- ]?\d{3}[- ]?\d{4}/g, // (123) 456-7890
      /\d{3,4}[- ]?\d{6,7}/g // 0550 123456
    ];
    
    for (const regex of phoneRegexes) {
      const phoneMatches = cleanText.match(regex) || [];
      if (phoneMatches.length > 0) {
        result.phone = phoneMatches[0];
        break;
      }
    }

    // Extract name - multiple approaches
    // First try to find name in standard formats
    const namePatterns = [
      /^(?:Name|Full Name|Candidate|Applicant)\s*[:\-]\s*(.*?)(?:\n|$)/im, // Name: John Doe
      /^(?:CV|Resume|Curriculum Vitae)\s*(?:of|for)?\s*[:\-]?\s*(.*?)(?:\n|$)/im, // CV of: John Doe
      /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m, // JOHN DOE at start of line
      /^\s*([A-Z][a-z]{1,20}\s+(?:[A-Z]\.?\s+)?[A-Z][a-z]{2,20})\s*$/m // John A. Doe
    ];
    
    let nameFound = false;
    for (const pattern of namePatterns) {
      const nameMatch = cleanText.match(pattern);
      if (nameMatch && nameMatch[1]) {
        const potentialName = nameMatch[1].trim();
        if (potentialName.length > 3 && potentialName.length < 50) {
          result.name = potentialName;
          nameFound = true;
          break;
        }
      }
    }
    
    // If we couldn't find the name with patterns, try using the file name
    if (!nameFound && filePath) {
      const fileName = path.basename(filePath, path.extname(filePath));
      // Process filename to remove timestamps, etc.
      const nameFromFile = fileName.replace(/^\d+[-_]/, ''); // Remove leading timestamps
      
      // Convert to proper case
      result.name = nameFromFile
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    // If we still don't have a name, search for capitalized words at the start of the text
    if (!result.name || result.name.length < 3) {
      // Get first 500 chars of text and look for capitalized words patterns
      const firstPart = cleanText.substring(0, 500);
      const nameCandidate = firstPart.match(/(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*(?:\n|$)/);
      if (nameCandidate && nameCandidate[1]) {
        result.name = nameCandidate[1].trim();
      }
    }

    // Extract education information
    const degreeTypes = [
      'Ph\\.?D\\.?', 'Doctorate', 'Doctoral', 
      'Master(?:\'s|\\.?s|\\.)?', 'M\\.?A\\.?', 'M\\.?S\\.?', 'M\\.?Ed\\.?', 'M\\.?B\\.?A\\.?',
      'Bachelor(?:\'s|\\.?s|\\.)?', 'B\\.?A\\.?', 'B\\.?S\\.?', 'B\\.?Ed\\.?',
      'Associate(?:\'s|\\.?s|\\.)?', 'A\\.?A\\.?', 'A\\.?S\\.?'
    ];
    
    // Multiple patterns to catch different degree formats
    const degreePatterns = [
      // Specific degree with field
      new RegExp(`(${degreeTypes.join('|')})\\s+(?:degree|of|in)?\\s+([A-Za-z\\s]+)`, 'i'),
      // Degree listed in education section
      new RegExp(`education.*?(${degreeTypes.join('|')})`, 'is'),
      // Line starting with degree
      new RegExp(`^\\s*(${degreeTypes.join('|')})\\s+`, 'im')
    ];
    
    for (const pattern of degreePatterns) {
      const degreeMatch = cleanText.match(pattern);
      if (degreeMatch) {
        const degreeType = degreeMatch[1];
        if (degreeType.match(/Ph\.?D|Doctorate|Doctoral/i)) {
          result.degree = 'PhD';
        } else if (degreeType.match(/Master|\'s|M\.A|M\.S|M\.Ed|M\.B\.A/i)) {
          result.degree = 'Master';
        } else if (degreeType.match(/Bachelor|\'s|B\.A|B\.S|B\.Ed/i)) {
          result.degree = 'Bachelor';
        } else if (degreeType.match(/Associate|\'s|A\.A|A\.S/i)) {
          result.degree = 'Associate';
        }
        
        // Try to extract field if we have it in the match
        if (degreeMatch[2]) {
          result.degreeField = degreeMatch[2].trim();
        }
        break;
      }
    }
    
    // If no degree found, look for broader degree keywords
    if (!result.degree) {
      if (cleanText.match(/Ph\.?D|Doctorate|Doctoral/i)) {
        result.degree = 'PhD';
      } else if (cleanText.match(/Master|\'s|M\.A|M\.S|M\.Ed|M\.B\.A/i)) {
        result.degree = 'Master';
      } else if (cleanText.match(/Bachelor|\'s|B\.A|B\.S|B\.Ed/i)) {
        result.degree = 'Bachelor';
      } else if (cleanText.match(/Associate|\'s|A\.A|A\.S/i)) {
        result.degree = 'Associate';
      }
    }
      
    // Try to extract the degree field if not found already
    if (!result.degreeField) {
      const educationFields = [
        'English', 'English Language', 'Linguistics', 'Education', 'Teaching', 
        'TESOL', 'TEFL', 'Literature', 'ESL', 'Applied Linguistics', 
        'Language Teaching', 'English Literature', 'Language Education'
      ];
      
      // Look for degree field near degree terms
      const degreeSection = cleanText.match(/(?:degree|education|qualification)s?[^\n]{0,50}(.*?)(?:\n\n|\n[A-Z]|$)/i);
      if (degreeSection && degreeSection[1]) {
        const section = degreeSection[1].toLowerCase();
        for (const field of educationFields) {
          if (section.includes(field.toLowerCase())) {
            result.degreeField = field;
            break;
          }
        }
      }
      
      // If still not found, search more broadly
      if (!result.degreeField) {
        for (const field of educationFields) {
          if (cleanText.match(new RegExp(`(?:in|of|with)\\s+${field}|${field}\\s+(?:degree|major)`, 'i'))) {
            result.degreeField = field;
            break;
          }
        }
      }
    }

    // Look for teaching certifications
    const certificationPatterns = [
      // Common TEFL/TESOL certification formats
      /(?:TEFL|TESOL|CELTA|DELTA|TESL|TKT|CertTESOL|DipTESOL|Trinity|Cambridge)\s+(?:certificate|certification|certified|diploma)/i,
      // Mentions of certification in lists
      /[\u2022\-*]\s*(?:TEFL|TESOL|CELTA|DELTA|TKT|Trinity)\b/im,
      // Any certification sections
      /(?:certifications?|qualifications?|credentials)\s*:?\s*([^\n]+)/i
    ];
    
    for (const pattern of certificationPatterns) {
      const certMatch = cleanText.match(pattern);
      if (certMatch) {
        result.hasCertifications = true;
        if (certMatch[1]) {
          result.certifications = certMatch[0];
        } else {
          // Extract certification context - grab the whole line or section
          const certLine = cleanText.match(new RegExp(`.{0,30}${certMatch[0]}.{0,30}`, 's'));
          result.certifications = certLine ? certLine[0] : certMatch[0];
        }
        break;
      }
    }
    
    // If still no certifications, look for certification mentions in general
    if (!result.hasCertifications) {
      if (cleanText.match(/(?:certified|certification|certificate|diploma)/i)) {
        // Get certification lines
        const certLines = cleanText.match(/.*(?:certified|certification|certificate|diploma).*/gi);
        if (certLines && certLines.length > 0) {
          result.hasCertifications = true;
          result.certifications = certLines.slice(0, 3).join('; ');
        }
      }
    }

    // Extract years of experience
    const experiencePatterns = [
      /(\d+)\+?\s+years?\s+(?:of)?\s*experience/i,
      /experience\s*[:=]\s*(\d+)\+?\s+years?/i,
      /(?:have|with|possess(?:es)?)\s+(\d+)\+?\s+years?\s+(?:of)?\s*experience/i,
      /over\s+(\d+)\s+years?\s+(?:of)?\s+experience/i,
      /experience\s*:\s*(?:.*?)(\d+)\s+years?/i
    ];
    
    for (const pattern of experiencePatterns) {
      const yearsMatch = cleanText.match(pattern);
      if (yearsMatch && yearsMatch[1]) {
        const years = parseInt(yearsMatch[1], 10);
        if (!isNaN(years) && years > 0 && years < 100) { // Sanity check
          result.yearsExperience = years;
          break;
        }
      }
    }
    
    // If no explicit years found, try to calculate from work history
    if (!result.yearsExperience) {
      const workExpSection = cleanText.match(/(?:work|professional|teaching)\s+experience\s*:?([\s\S]*?)(?:education|skills|languages|reference|$)/i);
      if (workExpSection && workExpSection[1]) {
        // Look for year ranges like 2010-2023 or 2010 - present
        const yearRanges = workExpSection[1].match(/(?:19|20)\d{2}\s*[-\u2013\u2014]\s*(?:(?:19|20)\d{2}|present|current|now)/gi) || [];
        if (yearRanges.length > 0) {
          let earliestYear = new Date().getFullYear();
          let latestYear = 0;
          
          for (const range of yearRanges) {
            const years = range.match(/((?:19|20)\d{2})\s*[-\u2013\u2014]\s*((?:19|20)\d{2}|present|current|now)/i);
            if (years) {
              const startYear = parseInt(years[1], 10);
              const endYearStr = years[2].toLowerCase();
              const endYear = endYearStr.match(/present|current|now/) ? new Date().getFullYear() : parseInt(endYearStr, 10);
              
              if (startYear && !isNaN(startYear) && startYear < earliestYear) {
                earliestYear = startYear;
              }
              if (endYear && !isNaN(endYear) && endYear > latestYear) {
                latestYear = endYear;
              }
            }
          }
          
          if (latestYear > earliestYear) {
            result.yearsExperience = latestYear - earliestYear;
          }
        }
      }
    }

    // Check if candidate is a native English speaker
    const nativeSpeakerPatterns = [
      /native\s+(?:English|language)\s+speaker/i,
      /English\s+(?:is|as)\s+(?:a|my)\s+(?:native|first|primary|mother)\s+(?:language|tongue)/i,
      /(?:native|first|primary|mother)\s+(?:language|tongue)\s+(?:is|:|-)\s+English/i,
      /first\s+language:\s*English/i,
      /language\s+skills[^\n]*?\s+English\s*\(\s*native\s*\)/i
    ];
    
    for (const pattern of nativeSpeakerPatterns) {
      if (cleanText.match(pattern)) {
        result.nativeEnglishSpeaker = true;
        break;
      }
    }

    // Check for military experience
    const militaryPatterns = [
      /(?:military|army|navy|air force|marine|forces|corps)\s+(?:experience|service|background|career)/i,
      /(?:served|service)\s+in\s+(?:the)?\s+(?:military|army|navy|air force|marine|forces)/i,
      /(?:veteran|officer|soldier|airman|sailor|servicemember)/i,
      /(?:military|army|navy|air force|marine)\s+(?:college|academy|school|training)/i
    ];
    
    for (const pattern of militaryPatterns) {
      if (cleanText.match(pattern)) {
        result.militaryExperience = true;
        break;
      }
    }

    // Extract nationality
    const nationalityPatterns = [
      /nationality\s*:\s*([A-Za-z\s]+)/i,
      /citizenship\s*:\s*([A-Za-z\s]+)/i,
      /citizen\s+of\s+([A-Za-z\s]+)/i,
      /country\s+of\s+origin\s*:\s*([A-Za-z\s]+)/i
    ];
    
    for (const pattern of nationalityPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const nationality = match[1].trim();
        if (nationality.length > 2 && nationality.length < 30) {
          result.nationality = nationality;
          break;
        }
      }
    }

    // Calculate success metrics
    const requiredFields = ['name', 'email', 'phone', 'degree'];
    const extractedFieldCount = requiredFields.filter(field => 
      result[field as keyof ExtractedCandidateInfo] !== undefined
    ).length;
    
    // Get successful fields for logging
    const successfulFields = Object.keys(result).filter(k => 
      k !== 'status' && result[k as keyof ExtractedCandidateInfo] !== undefined &&
      result[k as keyof ExtractedCandidateInfo] !== null && 
      result[k as keyof ExtractedCandidateInfo] !== ''
    );
    
    console.log(`Successfully extracted ${extractedFieldCount} fields: ${successfulFields.join(', ')}`);
    return result;
  } catch (error) {
    console.error('Error extracting candidate info from text:', error);
    return { status: 'new' };
  }
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
    const extension = path.extname(filePath).toLowerCase().substring(1) || '';
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
      console.log(`Successfully extracted ${extractedText.length} characters of text from file`);
    } else {
      console.warn('No text was extracted from the file');
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return "";
  }
}