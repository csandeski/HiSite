import { useEffect } from 'react';

interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export function useUTMTracking() {
  // Capture and store UTM parameters on mount
  useEffect(() => {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Extract UTM parameters
    const newUTMs: UTMParams = {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
    };
    
    // Check if there are any new UTM parameters present
    const hasUTMs = Object.values(newUTMs).some(value => value !== undefined);
    
    if (hasUTMs) {
      // Get existing UTMs from localStorage
      let existingUTMs: UTMParams = {};
      try {
        const stored = localStorage.getItem('utm_params');
        if (stored) {
          existingUTMs = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error reading existing UTM params:', error);
      }
      
      // Merge new UTMs with existing ones (new ones overwrite if present)
      const mergedUTMs: UTMParams = {
        ...existingUTMs,
        ...Object.fromEntries(
          Object.entries(newUTMs).filter(([_, value]) => value !== undefined)
        )
      };
      
      // Only update localStorage if new UTMs are present
      localStorage.setItem('utm_params', JSON.stringify(mergedUTMs));
    }
  }, []); // Run only once on mount
  
  // Function to get stored UTM parameters
  const getStoredUTMs = (): UTMParams => {
    try {
      const stored = localStorage.getItem('utm_params');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading UTM params from localStorage:', error);
    }
    
    // Fallback to current URL params if localStorage is empty
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
    };
  };
  
  // Function to clear stored UTMs (useful for testing or logout)
  const clearStoredUTMs = () => {
    localStorage.removeItem('utm_params');
  };
  
  return {
    getStoredUTMs,
    clearStoredUTMs,
  };
}