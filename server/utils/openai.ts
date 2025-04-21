import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { Candidate } from "@shared/schema";
import { parsePDF } from "./pdfParser";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Extract candidate information from resume
export async function extractCandidateInfo(filePath: string): Promise<Partial<Candidate>> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileTypeResult = await fileTypeFromBuffer(fileBuffer);
    
    if (!fileTypeResult) {
      throw new Error("Could not determine file type");
    }
    
    const fileExtension = fileTypeResult.ext;
    
    // Extract text content from file
    let content = "";
    
    if (fileExtension === "pdf") {
      // For PDFs, use the file data directly with OpenAI
      content = await extractTextFromPDF(filePath);
    } else if (["doc", "docx"].includes(fileExtension)) {
      // For Word docs, we'll handle with a different approach if needed
      content = await extractTextFromDOCX(filePath);
    } else if (["txt"].includes(fileExtension)) {
      // For plain text, read directly
      content = fs.readFileSync(filePath, "utf-8");
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }
    
    // If we have content, use OpenAI to extract structured data
    if (content) {
      return await parseResumeWithAI(content);
    }
    
    throw new Error("Could not extract content from the file");
  } catch (error) {
    console.error("Error extracting candidate info:", error);
    throw error;
  }
}

// Extract text from PDF using OpenAI's document analysis capabilities
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    return await parsePDF(filePath);
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

// Extract text from DOCX file
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    // For this implementation, we're using a simplified approach:
    // Convert the file to base64 and use OpenAI to extract text
    const fileContent = fs.readFileSync(filePath);
    const base64String = fileContent.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system", 
          content: "Extract all text content from this Word document, preserving the structure as much as possible."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text from this Word document"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64String}`
              }
            }
          ],
        }
      ]
    });
    
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw error;
  }
}

// Use AI to parse the resume content and extract structured data
async function parseResumeWithAI(content: string): Promise<Partial<Candidate>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
          You are an expert resume analyzer for English Language Training (ELT) instructor positions.
          Extract relevant candidate information from the resume text provided.
          Format your response as a JSON object with the following structure:
          {
            "name": "Full name of the candidate",
            "email": "Email address",
            "phone": "Phone number",
            "degree": "Highest educational degree (Bachelor, Master, PhD, or High School)",
            "degreeField": "Field of study for the highest degree",
            "yearsExperience": Number of years of teaching experience,
            "hasCertifications": Boolean indicating if they have teaching certifications,
            "certifications": "Description of teaching certifications (TEFL, CELTA, etc.)",
            "nativeEnglishSpeaker": Boolean indicating if they appear to be a native English speaker,
            "militaryExperience": Boolean indicating if they have military experience
          }
          `
        },
        {
          role: "user",
          content: content
        }
      ]
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    console.log("AI parsed resume result:", result);
    
    return {
      name: result.name,
      email: result.email,
      phone: result.phone,
      degree: result.degree,
      degreeField: result.degreeField,
      yearsExperience: typeof result.yearsExperience === 'number' ? result.yearsExperience : 
                      (typeof result.yearsExperience === 'string' ? parseInt(result.yearsExperience) : 0),
      hasCertifications: result.hasCertifications,
      certifications: result.certifications,
      nativeEnglishSpeaker: result.nativeEnglishSpeaker,
      militaryExperience: result.militaryExperience,
      // Default fields
      status: "new",
      schoolId: undefined,
      notes: "",
      resumeUrl: ""
    };
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    return {};
  }
}

// Rank candidates based on qualifications
export async function rankCandidatesWithAI(candidates: Candidate[]): Promise<{ rankedCandidates: Candidate[], rationale: string }> {
  try {
    // Prepare candidate data for the AI
    const candidateData = candidates.map(c => ({
      id: c.id,
      name: c.name,
      degree: c.degree,
      degreeField: c.degreeField,
      yearsExperience: c.yearsExperience,
      hasCertifications: c.hasCertifications,
      certifications: c.certifications,
      nativeEnglishSpeaker: c.nativeEnglishSpeaker,
      militaryExperience: c.militaryExperience,
      status: c.status,
      classroomManagement: c.classroomManagement,
      grammarProficiency: c.grammarProficiency,
      vocabularyProficiency: c.vocabularyProficiency
    }));
    
    // Use OpenAI to rank candidates
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
          You are an expert ELT instructor recruiter. Analyze and rank candidates based on the following criteria:
          
          1. Education (highest weight for Master's or PhD in TESOL, English, Education, or related field)
          2. Teaching experience (years)
          3. Certifications (TESOL, CELTA, etc.)
          4. Native English speaker status
          5. Military experience (a plus for this context)
          6. Proficiency scores (classroom management, grammar, vocabulary)
          
          Provide your output as a JSON with the following structure:
          {
            "rankedCandidates": [id1, id2, id3, ...],  // Array of candidate IDs in rank order (best first)
            "rationale": "Explanation of your ranking methodology and key observations"
          }
          
          Provide detailed rationale explaining why candidates were ranked in this order.
          Focus on identifying the top 10 candidates.
          `
        },
        {
          role: "user",
          content: JSON.stringify(candidateData)
        }
      ]
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Map ranked IDs back to full candidate objects
    const candidatesMap = new Map(candidates.map(c => [c.id, c]));
    const rankedCandidates = (result.rankedCandidates || [])
      .map((id: number) => candidatesMap.get(id))
      .filter((c): c is Candidate => !!c);
    
    return {
      rankedCandidates: rankedCandidates.slice(0, 10), // Ensure we return max 10
      rationale: result.rationale || "Candidates ranked based on qualifications."
    };
  } catch (error) {
    console.error("Error ranking candidates with AI:", error);
    throw error;
  }
}