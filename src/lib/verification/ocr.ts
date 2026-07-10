// OCR Pipeline for Document Parsing
// Handles document download, text extraction, and field extraction

import crypto from 'crypto';

export interface OcrResult {
  success: boolean;
  raw_text?: string;
  extracted_fields?: {
    ico?: string;
    company_name?: string;
    trade_license_number?: string;
    vat_number?: string;
    issue_date?: string;
    address?: string;
  };
  confidence: number; // 0-1
  errors?: string[];
  file_hash?: string;
}

// OCR Configuration
export const OCR_CONFIG = {
  // Minimum confidence threshold for auto-verification
  MIN_CONFIDENCE: 0.75,
  
  // Supported file types
  SUPPORTED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'],
  
  // Max file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Supported languages for OCR
  SUPPORTED_LANGUAGES: ['cs', 'en', 'de', 'sk'],
};

// Calculate file hash for audit
export async function calculateFileHash(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file for hashing');
    }
    const buffer = await response.arrayBuffer();
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.from(buffer));
    return hash.digest('hex');
  } catch (error) {
    // Return placeholder hash if file cannot be fetched
    return crypto.createHash('sha256').update(fileUrl).digest('hex');
  }
}

// Simulated OCR extraction (in production, use Tesseract.js or cloud OCR)
// This is a mock implementation that would be replaced with actual OCR
export async function extractTextFromDocument(
  fileUrl: string,
  mimeType: string
): Promise<{ text: string; confidence: number }> {
  try {
    // In production, integrate with:
    // - Tesseract.js (local, free)
    // - AWS Textract
    // - Google Cloud Vision
    // - Azure Computer Vision
    
    // For demo, simulate OCR processing
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Document fetch failed');
    }
    
    // Check file size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > OCR_CONFIG.MAX_FILE_SIZE) {
      throw new Error('File too large for OCR');
    }
    
    // In real implementation, this would process the document
    // For now, return placeholder that indicates where real OCR would integrate
    return {
      text: `[OCR placeholder - would process ${mimeType} file]`,
      confidence: 0.5 // Lower confidence for placeholder
    };
  } catch (error) {
    throw new Error(`OCR processing failed: ${error}`);
  }
}

// Extract business fields from OCR text
export function extractBusinessFields(ocrText: string): OcrResult['extracted_fields'] {
  const fields: OcrResult['extracted_fields'] = {};
  
  // Extract IČO
  const icoMatch = ocrText.match(/(?:IČO|IČO|ico|ICO)[:\s]*(\d{8})/i) ||
                   ocrText.match(/\b(\d{8})\b(?=\s*(?:s\.r\.o\.|a\.s\.|v\.o\.s\.|$))/i);
  if (icoMatch) {
    fields.ico = icoMatch[1];
  }
  
  // Extract company name
  const namePatterns = [
    /(?:obchodní jméno|jméno|název|společnost)[:\s]*([A-Z][^\n\r]{5,50})/i,
    /([A-Z][A-Za-zÀ-ÿ\s]{5,50})(?:s\.r\.o\.|a\.s\.|v\.o\.s\.)/,
    /(?:company|business)[:\s]*([A-Z][^\n\r]{5,50})/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      fields.company_name = match[1].trim();
      break;
    }
  }
  
  // Extract trade license number
  const licensePatterns = [
    /(?:živnost|trade license|licence)[:\s]*([A-Z]{2,4}[- ]?\d+)/i,
    /VO[- ]?(\d+)/i,
    /(?:číslo|cislo)[:\s]*([A-Z0-9-]+)/i,
  ];
  
  for (const pattern of licensePatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      fields.trade_license_number = match[1].trim();
      break;
    }
  }
  
  // Extract VAT number
  const vatMatch = ocrText.match(/(?:DIČ|DIC|VAT|DPH)[:\s]*([A-Z]{2}\d{8,12})/i) ||
                   ocrText.match(/\b([A-Z]{2}\d{8,12})\b/i);
  if (vatMatch) {
    fields.vat_number = vatMatch[1];
  }
  
  // Extract address
  const addressPatterns = [
    /(?:adresa|sídlo|address)[:\s]*([^\n\r]{10,100})/i,
    /(?:ulice|street)[:\s]*([^\n\r]{5,80})/i,
    /(?:město|místo|city)[:\s]*([^\n\r]{5,50})/i,
  ];
  
  for (const pattern of addressPatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      fields.address = match[1].trim();
      break;
    }
  }
  
  // Extract date
  const datePatterns = [
    /(?:datum| date|vystaveno)[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
    /(?:platnost|valid)[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      fields.issue_date = match[1].trim();
      break;
    }
  }
  
  return fields;
}

// Calculate OCR confidence based on extracted fields
export function calculateOcrConfidence(
  extractedFields: OcrResult['extracted_fields'],
  requiredFields: string[]
): number {
  let score = 0;
  let totalWeight = 0;
  
  const fieldWeights: Record<string, number> = {
    ico: 0.4,
    company_name: 0.25,
    trade_license_number: 0.2,
    vat_number: 0.1,
    address: 0.05,
  };
  
  const fields = extractedFields || {};
  
  for (const field of requiredFields) {
    const weight = fieldWeights[field] || 0.1;
    totalWeight += weight;
    
    if (fields[field as keyof typeof fields]) {
      score += weight;
    }
  }
  
  return totalWeight > 0 ? score / totalWeight : 0;
}

// Validate extracted IČO
export function validateExtractedIco(ico: string | undefined, aresIco: string | undefined): {
  match: boolean;
  confidence: number;
} {
  if (!ico && !aresIco) {
    return { match: false, confidence: 0 };
  }
  
  if (ico && aresIco) {
    const cleanIco = ico.replace(/\s/g, '');
    const cleanAresIco = aresIco.replace(/\s/g, '');
    
    if (cleanIco === cleanAresIco) {
      return { match: true, confidence: 1.0 };
    }
    
    return { match: false, confidence: 0 };
  }
  
  // If only one is present, moderate confidence
  return { match: false, confidence: 0.5 };
}

// Process uploaded document
export async function processDocument(
  fileUrl: string,
  mimeType: string,
  expectedIco?: string
): Promise<OcrResult> {
  const errors: string[] = [];
  let confidence = 0;
  
  try {
    // Validate file type
    if (!OCR_CONFIG.SUPPORTED_TYPES.includes(mimeType)) {
      errors.push(`Unsupported file type: ${mimeType}`);
      return { success: false, confidence: 0, errors };
    }
    
    // Calculate file hash
    const fileHash = await calculateFileHash(fileUrl);
    
    // Extract text (in production, use real OCR)
    const { text, confidence: textConfidence } = await extractTextFromDocument(fileUrl, mimeType);
    
    // Extract business fields
    const extractedFields = extractBusinessFields(text) || {};
    
    // Calculate overall confidence
    const requiredFields = expectedIco ? ['ico', 'company_name'] : ['company_name'];
    confidence = calculateOcrConfidence(extractedFields, requiredFields);
    
    // If expected IČO provided, check match
    if (expectedIco && extractedFields.ico) {
      const icoMatch = validateExtractedIco(extractedFields.ico, expectedIco);
      confidence = (confidence + icoMatch.confidence) / 2;
    }
    
    return {
      success: true,
      raw_text: text.substring(0, 5000), // Limit stored text
      extracted_fields: extractedFields,
      confidence,
      file_hash: fileHash
    };
  } catch (error) {
    errors.push(`Processing error: ${error}`);
    return { success: false, confidence: 0, errors };
  }
}

// Process multiple documents
export async function processDocuments(
  documents: Array<{ file_url: string; mime_type: string }>,
  expectedIco?: string
): Promise<OcrResult[]> {
  const results = await Promise.all(
    documents.map(doc => processDocument(doc.file_url, doc.mime_type, expectedIco))
  );
  
  return results;
}

// Get best OCR result from multiple documents
export function getBestOcrResult(results: OcrResult[]): OcrResult | null {
  if (results.length === 0) return null;
  
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length === 0) return null;
  
  return successfulResults.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
}