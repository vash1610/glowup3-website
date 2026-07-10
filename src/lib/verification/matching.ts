// Fuzzy Matching Engine for Business Verification
// Implements Levenshtein distance and token-set ratio for string matching

export interface MatchResult {
  score: number; // 0-1, higher is better
  match_type: 'exact' | 'high' | 'medium' | 'low' | 'none';
  details?: string;
}

// Configurable thresholds
export const MATCH_THRESHOLDS = {
  exact: 1.0,
  high: 0.9,
  medium: 0.75,
  low: 0.5,
};

// Remove diacritics for comparison
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Levenshtein distance (edit distance)
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate similarity score (0-1)
export function similarityScore(a: string, b: string): number {
  const normalizedA = normalizeString(a);
  const normalizedB = normalizeString(b);

  if (normalizedA === normalizedB) return 1.0;
  if (normalizedA.length === 0 || normalizedB.length === 0) return 0;

  const maxLen = Math.max(normalizedA.length, normalizedB.length);
  const distance = levenshteinDistance(normalizedA, normalizedB);
  
  return 1 - distance / maxLen;
}

// Token-set ratio (handles word reordering)
export function tokenSetRatio(str1: string, str2: string): number {
  const tokens1 = new Set(normalizeString(str1).split(/\s+/).filter(Boolean));
  const tokens2 = new Set(normalizeString(str2).split(/\s+/).filter(Boolean));

  const intersection = [...tokens1].filter(t => tokens2.has(t)).length;
  const union = new Set([...tokens1, ...tokens2]).size;

  if (union === 0) return 0;
  return intersection / union;
}

// Combined matching score
export function calculateMatchScore(a: string, b: string): number {
  const levSim = similarityScore(a, b);
  const tokenSim = tokenSetRatio(a, b);
  
  // Weight: prefer Levenshtein for similar lengths, token-set for different orders
  const lengthDiff = Math.abs(a.length - b.length);
  const weight = lengthDiff > 10 ? 0.3 : 0.7;
  
  return levSim * weight + tokenSim * (1 - weight);
}

// Match company names
export function matchCompanyName(declaredName: string, officialName: string): MatchResult {
  const score = calculateMatchScore(declaredName, officialName);
  
  let match_type: MatchResult['match_type'];
  if (score >= MATCH_THRESHOLDS.exact) {
    match_type = 'exact';
  } else if (score >= MATCH_THRESHOLDS.high) {
    match_type = 'high';
  } else if (score >= MATCH_THRESHOLDS.medium) {
    match_type = 'medium';
  } else if (score >= MATCH_THRESHOLDS.low) {
    match_type = 'low';
  } else {
    match_type = 'none';
  }

  // IČO is source of truth - exact IČO match overrides name mismatch
  return {
    score,
    match_type,
    details: `Score: ${(score * 100).toFixed(1)}%`
  };
}

// Match IČO (exact match only - IČO is authoritative)
export function matchIco(declaredIco: string, officialIco: string): MatchResult {
  const cleanDeclared = declaredIco.replace(/\s/g, '');
  const cleanOfficial = officialIco.replace(/\s/g, '');
  
  if (cleanDeclared === cleanOfficial) {
    return { score: 1.0, match_type: 'exact' };
  }
  
  return { score: 0, match_type: 'none' };
}

// Match VAT number
export function matchVat(declaredVat: string, officialVat: string): MatchResult {
  const cleanDeclared = declaredVat.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
  const cleanOfficial = officialVat.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
  
  if (cleanDeclared === cleanOfficial) {
    return { score: 1.0, match_type: 'exact' };
  }
  
  // Check if only country code differs
  if (cleanDeclared.endsWith(cleanOfficial) || cleanOfficial.endsWith(cleanDeclared)) {
    return { score: 0.95, match_type: 'high' };
  }
  
  return { score: 0, match_type: 'none' };
}

// Match trade license number
export function matchTradeLicense(declared: string, official: string): MatchResult {
  const cleanDeclared = declared.replace(/\s/g, '').toUpperCase();
  const cleanOfficial = official.replace(/\s/g, '').toUpperCase();
  
  if (cleanDeclared === cleanOfficial) {
    return { score: 1.0, match_type: 'exact' };
  }
  
  // Partial match for common patterns
  if (cleanDeclared.includes(cleanOfficial) || cleanOfficial.includes(cleanDeclared)) {
    return { score: 0.85, match_type: 'high' };
  }
  
  return { score: 0, match_type: 'none' };
}

// Match address (simplified)
export function matchAddress(declared: string, official: string): MatchResult {
  const normalizedDeclared = normalizeString(declared);
  const normalizedOfficial = normalizeString(official);
  
  const score = calculateMatchScore(normalizedDeclared, normalizedOfficial);
  
  return {
    score,
    match_type: score >= 0.8 ? 'high' : score >= 0.5 ? 'medium' : score >= 0.3 ? 'low' : 'none',
    details: `Address similarity: ${(score * 100).toFixed(1)}%`
  };
}

// Extract IČO from text (OCR results)
export function extractIcoFromText(text: string): string | null {
  // Czech IČO is 8 digits
  const icoPatterns = [
    /(?:IČO|IČO|ico|ICO)[:\s]*(\d{8})/i,
    /(\d{8})\s*(?:DIČ|DIC|VAT)/i,
    /(\d{8})\s*(?:s\.r\.o\.|a\.s\.|v\.o\.s\.|k\.s\.)/i,
    /(\d{8})/
  ];
  
  for (const pattern of icoPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Validate IČO checksum (Czech business ID)
export function validateIcoChecksum(ico: string): boolean {
  const clean = ico.replace(/\s/g, '');
  
  if (!/^\d{8}$/.test(clean)) {
    return false;
  }
  
  // Check digit calculation
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(clean[i]) * (8 - i);
  }
  
  const checkDigit = sum % 11;
  
  // Special handling for 00000000
  if (clean === '00000000') return false;
  
  return checkDigit === parseInt(clean[7]);
}

// Extract VAT from text
export function extractVatFromText(text: string): string | null {
  const vatPatterns = [
    /(?:DIČ|DIC|VAT|Číslo DPH)[:\s]*([A-Z]{2}\d{8,12})/i,
    /(?:IČO|ICO)[:\s]*(\d{8}).*(?:DIČ|DIC|VAT)[:\s]*([A-Z]{2}\d+)/i,
    /([A-Z]{2}\d{8,12})/
  ];
  
  for (const pattern of vatPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Overall confidence calculation
export function calculateOverallConfidence(
  icoMatch: MatchResult,
  nameMatch: MatchResult,
  vatMatch?: MatchResult,
  addressMatch?: MatchResult
): number {
  // IČO is most important - exact match is 100%
  // Name match is 80% of remaining weight
  // VAT and address are 10% each if provided
  
  let totalWeight = 1;
  let weightedSum = 0;
  
  // IČO: 60% weight (most authoritative)
  weightedSum += icoMatch.score * 0.6;
  
  // Name: 25% weight
  weightedSum += nameMatch.score * 0.25;
  
  if (vatMatch) {
    weightedSum += vatMatch.score * 0.1;
  } else {
    totalWeight += 0.1; // If VAT not required, redistribute
  }
  
  if (addressMatch) {
    weightedSum += addressMatch.score * 0.05;
  } else {
    totalWeight += 0.05;
  }
  
  return Math.min(weightedSum / (totalWeight * 0.6 + 0.25 + 0.1 + 0.05), 1.0);
}