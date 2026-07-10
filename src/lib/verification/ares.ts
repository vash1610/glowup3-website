// ARES (Czech Business Register) Connector
// Official registry for company IČO verification
// Uses real ARES REST API: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest

export interface AresResponse {
  found: boolean;
  company_name?: string;
  legal_form?: string;
  address?: string;
  registration_date?: string;
  status?: 'active' | 'inactive' | 'dissolved';
  ico?: string;
  dic?: string;
  cz_nace?: string[];
  rzp_status?: string;
  vat_registered?: boolean;
  error?: string;
}

// ARES REST API - official OpenAPI endpoint
const ARES_API_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';

export async function checkAres(ico: string): Promise<AresResponse> {
  const cleanIco = ico.replace(/\s/g, '');
  
  if (!/^\d{8}$/.test(cleanIco)) {
    return { found: false, error: 'Invalid IČO format - must be 8 digits' };
  }
  
  console.log(`[ARES] Checking IČO: ${cleanIco}`);
  
  try {
    const response = await fetch(`${ARES_API_BASE}/ekonomicke-subjekty/${cleanIco}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { found: false, error: 'Company not found in ARES' };
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return parseAresResponse(data);
    
  } catch (error) {
    console.error(`[ARES] Error:`, error);
    return { 
      found: false, 
      error: `ARES API error: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

function parseAresResponse(data: any): AresResponse {
  if (!data || !data.ico) {
    return { found: false, error: 'Invalid ARES response' };
  }

  // Get company name
  const companyName = data.obchodniJmeno || data.name;
  
  if (!companyName) {
    return { found: false, error: 'Company name not found' };
  }

  // Get address
  let address = '';
  if (data.sidlo) {
    if (typeof data.sidlo === 'string') {
      address = data.sidlo;
    } else if (data.sidlo.textovaAdresa) {
      address = data.sidlo.textovaAdresa;
    }
  }

  // Get legal form (code)
  const legalForm = data.pravniForma || data.pravniFormaRos;

  // Get registration date
  const registrationDate = data.datumVzniku;

  // Get DIC (VAT number)
  const dic = data.dic;

  // Get CZ-NACE codes
  const czNace = data.czNace || data.czNace2008;

  // Determine status from registry states
  let status: 'active' | 'inactive' | 'dissolved' = 'active';
  if (data.seznamRegistraci) {
    const reg = data.seznamRegistraci;
    if (reg.stavZdrojeRes === 'ZRUSEN' || reg.stavZdrojeVr === 'ZRUSEN' || reg.stavZdrojeRos === 'ZRUSEN') {
      status = 'dissolved';
    } else if (reg.stavZdrojeRos === 'NEAKTIVNI') {
      status = 'inactive';
    }
  }

  // Get RŽP status
  const rzpStatus = data.seznamRegistraci?.stavZdrojeRzp;
  
  // Check VAT registration
  const vatRegistered = data.seznamRegistraci?.stavZdrojeDph === 'AKTIVNI';

  console.log(`[ARES] Found: ${companyName}, Status: ${status}, RŽP: ${rzpStatus}, VAT: ${vatRegistered}`);

  return {
    found: true,
    ico: data.ico,
    company_name: companyName,
    legal_form: legalForm,
    address,
    registration_date: registrationDate,
    status,
    dic,
    cz_nace: czNace,
    rzp_status: rzpStatus,
    vat_registered: vatRegistered
  };
}

// Also check RŽP specifically
export async function checkRzp(ico: string): Promise<AresResponse> {
  const cleanIco = ico.replace(/\s/g, '');
  
  try {
    const response = await fetch(`${ARES_API_BASE}/ekonomicke-subjekty-rzp/${cleanIco}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      return { found: false, error: 'RŽP not found' };
    }

    const data = await response.json();
    return parseAresResponse(data);
    
  } catch (error) {
    console.error(`[RŽP] Error:`, error);
    return { found: false, error: `RŽP API error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

export function getAresApiUrl(): string {
  return ARES_API_BASE;
}

// Health check
export async function checkAresHealth(): Promise<{ok: boolean, latency: number}> {
  const start = Date.now();
  try {
    // Use an invalid IČO to check API availability
    const response = await fetch(`${ARES_API_BASE}/ekonomicke-subjekty/99999999`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    // 404 means API is working, just no result
    return { ok: response.status === 404, latency: Date.now() - start };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}