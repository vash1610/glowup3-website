// VIES (VAT Information Exchange System) Connector
// EU official VAT verification service
// Uses real VIES API: https://ec.europa.eu/taxation_customs/vies

export interface ViesResponse {
  valid: boolean;
  vat_number?: string;
  name?: string;
  address?: string;
  country_code?: string;
  error?: string;
}

// VIES API endpoint
const VIES_API_BASE = 'https://ec.europa.eu/taxation_customs/vies';

export async function checkVies(vatNumber: string): Promise<ViesResponse> {
  try {
    // Clean VAT number
    const cleanVat = vatNumber.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
    
    // Extract country code
    const countryCode = cleanVat.substring(0, 2);
    const vatNumberOnly = cleanVat.substring(2);
    
    // Validate format
    if (!/^[A-Z]{2}\d+$/.test(cleanVat)) {
      return { valid: false, error: 'Invalid VAT number format' };
    }

    // Try VIES API via SOAP or REST
    // VIES provides a SOAP service
    const soapRequest = buildViesSoapRequest(countryCode, vatNumberOnly);
    
    const response = await fetch(`${VIES_API_BASE}/checkVatService`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'Accept': 'text/xml',
        'User-Agent': 'Todayly-BusinessVerification/1.0'
      },
      body: soapRequest,
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      // Try REST endpoint
      return await checkViesRest(countryCode, vatNumberOnly);
    }

    const xmlText = await response.text();
    return parseViesResponse(xmlText);
  } catch (error) {
    console.error(`[VIES] Error checking VAT ${vatNumber}:`, error);
    
    // Try alternative
    try {
      const cleanVat = vatNumber.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
      const countryCode = cleanVat.substring(0, 2);
      const vatNumberOnly = cleanVat.substring(2);
      return await checkViesRest(countryCode, vatNumberOnly);
    } catch {
      return { valid: false, error: `VIES API error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

// Build SOAP request for VIES
function buildViesSoapRequest(countryCode: string, vatNumber: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soapenv:Body>
    <urn:checkVat>
      <urn:countryCode>${countryCode}</urn:countryCode>
      <urn:vatNumber>${vatNumber}</urn:vatNumber>
    </urn:checkVat>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// Try VIES REST API
async function checkViesRest(countryCode: string, vatNumber: string): Promise<ViesResponse> {
  try {
    const response = await fetch(
      `${VIES_API_BASE}/api/checkVatNumber?countryCode=${countryCode}&vatNumber=${vatNumber}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Todayly-BusinessVerification/1.0'
        },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      return { valid: false, error: 'VIES REST API unavailable' };
    }

    const data = await response.json();
    
    return {
      valid: Boolean(data.valid || data.isValid),
      vat_number: data.vatNumber || vatNumber,
      name: data.name || data.traderName,
      address: data.address || data.traderAddress,
      country_code: data.countryCode || countryCode
    };
  } catch (error) {
    return { valid: false, error: 'VIES REST API check failed' };
  }
}

// Parse VIES SOAP response
function parseViesResponse(xml: string): ViesResponse {
  try {
    const validMatch = xml.match(/<valid>(\w+)<\/valid>/i);
    const nameMatch = xml.match(/<name>([^<]*)<\/name>/i);
    const addressMatch = xml.match(/<address>([^<]*)<\/address>/i);
    const countryMatch = xml.match(/<countryCode>([^<]*)<\/countryCode>/i);
    const vatMatch = xml.match(/<vatNumber>([^<]*)<\/vatNumber>/i);

    const valid = validMatch ? validMatch[1].toLowerCase() === 'true' : false;
    
    return {
      valid,
      name: nameMatch ? nameMatch[1] : undefined,
      address: addressMatch ? addressMatch[1] : undefined,
      country_code: countryMatch ? countryMatch[1] : undefined,
      vat_number: vatMatch ? vatMatch[1] : undefined,
      error: valid ? undefined : 'VAT number invalid or not found'
    };
  } catch (error) {
    return { valid: false, error: 'Failed to parse VIES response' };
  }
}

// Validate VAT number format (basic check)
export function validateVatFormat(vatNumber: string): boolean {
  const clean = vatNumber.replace(/\s/g, '').replace(/-/g, '').toUpperCase();
  return /^[A-Z]{2}\d{8,12}$/.test(clean);
}

// Check if VAT is EU format
export function isEuVat(vatNumber: string): boolean {
  return validateVatFormat(vatNumber);
}

// Get VAT country code from IČO (for Czech)
export function getVatCountryFromIco(ico: string, countryCode: string = 'CZ'): string {
  // Czech IČO can be converted to DIČ by adding CZ prefix
  if (countryCode === 'CZ') {
    return `CZ${ico}`;
  }
  return `${countryCode}${ico}`;
}

// Export for testing
export function getViesApiUrl(): string {
  return VIES_API_BASE;
}