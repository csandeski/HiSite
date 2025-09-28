/**
 * Utility functions for redirecting to LiraPay checkout pages with UTM parameters
 */

interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// LiraPay checkout URLs
const LIRAPAY_URLS = {
  premium: 'https://pay.lirapaybr.com/UNwqYLPq',
  authorization: 'https://pay.lirapaybr.com/GEzPWRoy',
  pix_key_auth: 'https://pay.lirapaybr.com/KJDtYmEW',
};

/**
 * Build URL with UTM parameters
 */
function buildUrlWithUTMs(baseUrl: string, utmParams: UTMParams): string {
  const url = new URL(baseUrl);
  
  if (utmParams.utmSource) {
    url.searchParams.set('utm_source', utmParams.utmSource);
  }
  if (utmParams.utmMedium) {
    url.searchParams.set('utm_medium', utmParams.utmMedium);
  }
  if (utmParams.utmCampaign) {
    url.searchParams.set('utm_campaign', utmParams.utmCampaign);
  }
  if (utmParams.utmTerm) {
    url.searchParams.set('utm_term', utmParams.utmTerm);
  }
  if (utmParams.utmContent) {
    url.searchParams.set('utm_content', utmParams.utmContent);
  }
  
  return url.toString();
}

/**
 * Get stored UTM parameters from localStorage
 */
function getStoredUTMParams(): UTMParams {
  try {
    const stored = localStorage.getItem('utm_params');
    if (stored) {
      const params = JSON.parse(stored);
      return {
        utmSource: params.utmSource,
        utmMedium: params.utmMedium,
        utmCampaign: params.utmCampaign,
        utmTerm: params.utmTerm,
        utmContent: params.utmContent,
      };
    }
  } catch (error) {
    console.error('Error reading UTM params:', error);
  }
  
  return {};
}

/**
 * Redirect to LiraPay checkout page with UTM parameters
 */
export function redirectToLiraPay(
  type: 'premium' | 'authorization' | 'pix_key_auth',
  customUTMs?: UTMParams
) {
  const baseUrl = LIRAPAY_URLS[type];
  if (!baseUrl) {
    console.error(`Invalid LiraPay payment type: ${type}`);
    return;
  }
  
  // Get stored UTMs or use custom ones
  const utmParams = customUTMs || getStoredUTMParams();
  
  // Build URL with UTMs
  const finalUrl = buildUrlWithUTMs(baseUrl, utmParams);
  
  // Redirect to LiraPay
  window.location.href = finalUrl;
}