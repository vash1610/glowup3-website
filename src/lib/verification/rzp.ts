// RŽP (Czech Trade License Register) Connector
// Official registry for trade license verification
// Uses official XML API: https://rzp.gov.cz/rzp/api3-c/srv/vw/v30/vwinterface/xml

export interface RzpResponse {
  found: boolean;
  company_name?: string;
  address?: string;
  business_type?: string;
  role?: string;
  license_authority?: string;
  trade_license_status?: 'active' | 'inactive' | 'suspended' | 'not_found';
  error?: string;
  raw_data?: any;
}

// RŽP XML API endpoint
const RZP_API_URL = 'https://rzp.gov.cz/rzp/api3-c/srv/vw/v30/vwinterface/xml';

export async function checkRzp(ico: string): Promise<RzpResponse> {
  const cleanIco = ico.replace(/\s/g, '');
  
  if (!/^\d{8}$/.test(cleanIco)) {
    return { found: false, error: 'Invalid IČO format - must be 8 digits' };
  }
  
  console.log(`[RŽP] Checking IČO: ${cleanIco}`);
  
  try {
    // Build XML request
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<VerejnyWebDotaz version="3.0" xmlns="urn:cz:isvs:rzp:schemas:VerejnaCast:v1">
  <Kriteria>
    <IdentifikacniCislo>${cleanIco}</IdentifikacniCislo>
    <PlatnostZaznamu>1</PlatnostZaznamu>
  </Kriteria>
</VerejnyWebDotaz>`;

    const response = await fetch(RZP_API_URL + '?lang=cs', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=UTF-8',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; BusinessVerification/1.0)',
        'SOAPAction': ''
      },
      body: xmlRequest,
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    return parseRzpResponse(xmlText);
    
  } catch (error) {
    console.error(`[RŽP] Error:`, error);
    return { 
      found: false, 
      error: `RŽP API error: ${error instanceof Error ? error.message : 'Unknown'}` 
    };
  }
}

function parseRzpResponse(xmlText: string): RzpResponse {
  console.log(`[RŽP] Parsing response...`);
  
  // Check for error
  if (xmlText.includes('<Chyba>')) {
    const kodMatch = xmlText.match(/<KodChyby>(\d+)<\/KodChyby>/);
    const popisMatch = xmlText.match(/<PopisChyby>([^<]+)<\/PopisChyby>/);
    
    if (kodMatch && kodMatch[1] === '-5') {
      return { found: false, error: 'Trade license not found in RŽP', trade_license_status: 'not_found' };
    }
    
    return { 
      found: false, 
      error: popisMatch ? popisMatch[1] : 'Unknown RŽP error' 
    };
  }
  
  // Parse PodnikatelSeznam (list of business subjects)
  const podnikatelMatch = xmlText.match(/<PodnikatelSeznam[^>]*>([\s\S]*?)<\/PodnikatelSeznam>/);
  
  if (!podnikatelMatch) {
    return { found: false, error: 'Could not parse RŽP response' };
  }
  
  const podnikatelBlock = podnikatelMatch[1];
  
  // Extract company name
  const obchodniJmenoMatch = podnikatelBlock.match(/<ObchodniJmenoSeznam[^>]*>([^<]+)<\/ObchodniJmenoSeznam>/);
  const companyName = obchodniJmenoMatch ? obchodniJmenoMatch[1].trim() : undefined;
  
  // Extract IČO
  const icoMatch = podnikatelBlock.match(/<IdentifikacniCisloSeznam[^>]*>([^<]+)<\/IdentifikacniCisloSeznam>/);
  
  // Extract business type
  const typMatch = podnikatelBlock.match(/<TypPodnikatele[^>]*>([^<]+)<\/TypPodnikatele>/);
  const businessType = typMatch ? typMatch[1].trim() : undefined;
  
  // Extract address
  const adresaMatch = podnikatelBlock.match(/<AdresaPodnikaniSeznam[^>]*>([^<]+)<\/AdresaPodnikaniSeznam>/);
  const address = adresaMatch ? adresaMatch[1].trim() : undefined;
  
  // Extract role
  const roleMatch = podnikatelBlock.match(/<RoleSubjektu[^>]*>([^<]+)<\/RoleSubjektu>/);
  const role = roleMatch ? roleMatch[1].trim() : undefined;
  
  // Extract authority
  const uradMatch = podnikatelBlock.match(/<EvidujiciUrad[^>]*>([^<]+)<\/EvidujiciUrad>/);
  const licenseAuthority = uradMatch ? uradMatch[1].trim() : undefined;
  
  // Extract PodnikatelID for detailed lookup
  const podnikatelIdMatch = podnikatelBlock.match(/<PodnikatelID>([^<]+)<\/PodnikatelID>/);
  const podnikatelId = podnikatelIdMatch ? podnikatelIdMatch[1] : undefined;
  
  if (!companyName && !businessType) {
    return { found: false, error: 'No business data found in RŽP' };
  }
  
  console.log(`[RŽP] Found: ${companyName || businessType}`);
  
  return {
    found: true,
    company_name: companyName,
    address,
    business_type: businessType,
    role,
    license_authority: licenseAuthority,
    trade_license_status: 'active', // If found in RŽP, it's typically active
    raw_data: { podnikatel_id: podnikatelId }
  };
}

// Get detailed trade license info by PodnikatelID
export async function getRzpDetail(podnikatelId: string): Promise<RzpResponse> {
  console.log(`[RŽP] Getting detail for: ${podnikatelId}`);
  
  try {
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<VerejnyWebDotaz version="3.0" xmlns="urn:cz:isvs:rzp:schemas:VerejnaCast:v1">
  <PodnikatelID>${podnikatelId}</PodnikatelID>
  <Historie>0</Historie>
  <DruhVypisu>xml</DruhVypisu>
</VerejnyWebDotaz>`;

    const response = await fetch(RZP_API_URL + '?lang=cs', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'application/xml'
      },
      body: xmlRequest,
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    return parseRzpDetailResponse(xmlText);
    
  } catch (error) {
    console.error(`[RŽP Detail] Error:`, error);
    return { found: false, error: `RŽP detail error: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

function parseRzpDetailResponse(xmlText: string): RzpResponse {
  // Check for error
  if (xmlText.includes('<Chyba>')) {
    return { found: false, error: 'Trade license detail not found' };
  }
  
  // Parse main elements
  const obchodniJmenoMatch = xmlText.match(/<ObchodniJmeno[^>]*>([\s\S]*?)<\/ObchodniJmeno>/);
  const companyName = obchodniJmenoMatch ? extractObchodniJmeno(obchodniJmenoMatch[1]) : undefined;
  
  // Get trade license status from SeznamZivnosti
  let tradeLicenseStatus: 'active' | 'inactive' | 'suspended' = 'active';
  if (xmlText.includes('<Zanik>') || xmlText.includes('<Pozastaveni>')) {
    if (xmlText.includes('<PozastaveniAktivni>')) {
      tradeLicenseStatus = 'suspended';
    } else {
      tradeLicenseStatus = 'inactive';
    }
  }
  
  // Count active živnosti
  const zivnostiMatch = xmlText.match(/<SeznamZivnosti[^>]*>([\s\S]*?)<\/SeznamZivnosti>/);
  let activeCount = 0;
  let totalCount = 0;
  
  if (zivnostiMatch) {
    const zivnostMatches = zivnostiMatch[1].match(/<Zivnost[^>]*>/g);
    totalCount = zivnostMatches ? zivnostMatches.length : 0;
    
    // Check for active živnosti (not Zanik, not PozastaveniAktivni)
    if (totalCount > 0) {
      activeCount = totalCount;
      if (xmlText.includes('<Zanik>')) {
        activeCount = Math.max(0, activeCount - 1);
      }
    }
  }
  
  return {
    found: true,
    company_name: companyName,
    trade_license_status: tradeLicenseStatus,
    raw_data: {
      active_trade_count: activeCount,
      total_trade_count: totalCount
    }
  };
}

function extractObchodniJmeno(block: string): string | undefined {
  // Get current (active) value
  const hodnotaMatch = block.match(/<Hodnota>([^<]+)<\/Hodnota>/);
  return hodnotaMatch ? hodnotaMatch[1].trim() : undefined;
}

export function getRzpApiUrl(): string {
  return RZP_API_URL;
}

// Health check
export async function checkRzpHealth(): Promise<{ok: boolean, latency: number}> {
  const start = Date.now();
  try {
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<VerejnyWebDotaz version="3.0" xmlns="urn:cz:isvs:rzp:schemas:VerejnaCast:v1">
  <Kriteria>
    <IdentifikacniCislo>99999999</IdentifikacniCislo>
    <PlatnostZaznamu>1</PlatnostZaznamu>
  </Kriteria>
</VerejnyWebDotaz>`;

    const response = await fetch(RZP_API_URL + '?lang=cs', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xmlRequest,
      signal: AbortSignal.timeout(5000)
    });
    return { ok: response.status === 200, latency: Date.now() - start };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}