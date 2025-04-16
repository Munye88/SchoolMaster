import fs from 'fs';

interface PDFData {
  text: string;
  numpages?: number;
  info?: any;
}

/**
 * A simplified PDF parser that extracts text from PDF files
 * This avoids the issue with pdf-parse requiring test files during import
 */
export async function parsePDF(pdfBuffer: Buffer): Promise<PDFData> {
  try {
    // Dynamically import pdf-parse only when needed
    const pdfParse = await import('pdf-parse');
    
    // Extract text using the pdf-parse library
    const data = await pdfParse.default(pdfBuffer);
    
    return {
      text: data.text || '',
      numpages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // Return empty text if parsing fails
    return {
      text: '',
    };
  }
}