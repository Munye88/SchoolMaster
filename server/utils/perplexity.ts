import fetch from 'node-fetch';
import { Candidate } from '@shared/schema';

/**
 * Extract candidate information from resume text using Perplexity AI
 */
export async function parseResumeWithPerplexity(resumeText: string): Promise<Partial<Candidate>> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY environment variable must be set");
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a resume parsing expert. Extract the following information from the resume text: name, email, phone, degree, degreeField (the field of study), yearsExperience (as a number), certifications, nativeEnglishSpeaker (true/false), and militaryExperience (true/false). Return the information in JSON format only."
          },
          {
            role: "user",
            content: resumeText
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API returned an error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        }
      }>
    };
    
    // Parse the response content as JSON
    const content = data.choices[0]?.message?.content || "{}";
    console.log("Raw Perplexity response:", content);
    
    const result = JSON.parse(content);
    
    // Map the result to a candidate object
    return {
      name: result.name,
      email: result.email,
      phone: result.phone,
      degree: result.degree,
      degreeField: result.degreeField,
      yearsExperience: typeof result.yearsExperience === 'number' ? result.yearsExperience : 
                      (typeof result.yearsExperience === 'string' ? parseInt(result.yearsExperience) : 0),
      hasCertifications: !!result.certifications,
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
    console.error("Error parsing resume with Perplexity AI:", error);
    // Return an empty object in case of errors
    return {};
  }
}