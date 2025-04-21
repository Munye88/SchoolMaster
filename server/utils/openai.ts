import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";
import { Candidate } from "@shared/schema";

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

// Extract text from PDF using OpenAI's ability to process PDFs
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract all relevant text content from this PDF resume. Focus on preserving the structure and all details about education, experience, skills, and contact information."
        },
        {
          role: "user", 
          content: [
            {
              type: "text",
              text: "Extract all relevant text from this resume PDF:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${fs.readFileSync(filePath).toString("base64")}`
              }
            }
          ]
        }
      ]
    });
    
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

// Extract text from DOCX (simplified version)
async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    // Here we're using OpenAI to extract text from a document image
    // This is a fallback approach - in a production app you might want
    // to use a dedicated document parsing library
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract all relevant text content from this document. Focus on preserving the structure and all details about education, experience, skills, and contact information."
        },
        {
          role: "user", 
          content: [
            {
              type: "text",
              text: "Extract all relevant text from this resume document:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/octet-stream;base64,${fs.readFileSync(filePath).toString("base64")}`
              }
            }
          ]
        }
      ]
    });
    
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw error;
  }
}

// Parse resume content using GPT-4o
async function parseResumeWithAI(content: string): Promise<Partial<Candidate>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Extract structured information from the resume text. Return a JSON object with these fields:
          - name: Full name of the candidate
          - email: Email address
          - phone: Phone number
          - degree: Highest degree obtained (Bachelor, Master, PhD, etc.)
          - degreeField: Field of study
          - yearsExperience: Total years of teaching/educational experience as a number
          - hasCertifications: Boolean if they have any teaching certifications
          - certifications: List of teaching certifications (CELTA, TEFL, TESOL, etc.)
          - militaryExperience: Boolean if they have military experience
          - nativeEnglishSpeaker: Best guess if they're a native English speaker based on education or background
          - notes: A brief summary of their key qualifications and fit for an English Language Training instructor position`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Convert any string representation of booleans to actual booleans
    if (typeof result.hasCertifications === "string") {
      result.hasCertifications = result.hasCertifications.toLowerCase() === "true";
    }
    if (typeof result.militaryExperience === "string") {
      result.militaryExperience = result.militaryExperience.toLowerCase() === "true";
    }
    if (typeof result.nativeEnglishSpeaker === "string") {
      result.nativeEnglishSpeaker = result.nativeEnglishSpeaker.toLowerCase() === "true";
    }
    
    // Convert years experience to number
    if (typeof result.yearsExperience === "string") {
      result.yearsExperience = parseInt(result.yearsExperience) || 0;
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    throw error;
  }
}

// Rank candidates using AI
export async function rankCandidatesWithAI(candidates: Candidate[]): Promise<{ rankedCandidates: Candidate[], rationale: string }> {
  try {
    const candidatesData = candidates.map(c => ({
      id: c.id,
      name: c.name,
      education: `${c.degree || "Unknown"} in ${c.degreeField || "Unknown"}`,
      yearsExperience: c.yearsExperience || 0,
      certifications: c.certifications || "None",
      hasCertifications: c.hasCertifications,
      militaryExperience: c.militaryExperience,
      nativeEnglishSpeaker: c.nativeEnglishSpeaker,
      grammarProficiency: c.grammarProficiency || 0,
      vocabularyProficiency: c.vocabularyProficiency || 0,
      classroomManagement: c.classroomManagement || 0,
      overallScore: c.overallScore || 0,
      status: c.status,
      notes: c.notes
    }));
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert recruitment assistant for English Language Training (ELT) instructors. 
          Rank the provided candidate data to select the top 10 candidates. 
          Consider these factors in descending order of importance:
          1. Teaching experience (years, especially in ESL/ELT)
          2. Relevant education (degrees in English, ESL, TESOL, or Education)
          3. Teaching certifications (CELTA, TEFL, TESOL)
          4. Native English speaker status
          5. Assessment scores (grammar, vocabulary, classroom management)
          6. Military experience (a plus but not required)
          
          Return a JSON object with:
          1. "rankedCandidates": Array of candidate IDs in ranked order (best first)
          2. "rationale": Brief explanation of your ranking methodology and key differentiators`
        },
        {
          role: "user",
          content: JSON.stringify(candidatesData)
        }
      ],
      response_format: { type: "json_object" }
    });
    
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