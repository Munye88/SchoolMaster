import OpenAI from "openai";
import fs from "fs";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function parsePDF(filePath: string): Promise<string> {
  try {
    const fileContent = fs.readFileSync(filePath);
    const base64String = fileContent.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "Extract all text content from this PDF document, preserving the structure as much as possible."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text from this PDF document"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64String}`
              }
            }
          ],
        }
      ]
    });
    
    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw error;
  }
}