/**
 * Facebook Pixel Service
 * Handles all Facebook Pixel tracking events with Advanced Matching
 */

// Declare fbq function type
declare global {
  interface Window {
    fbq: (
      command: string,
      event?: string,
      data?: any
    ) => void;
  }
}

/**
 * Hashes a string using SHA-256 for Advanced Matching
 * Facebook requires user data to be hashed before sending
 */
async function hashValue(value: string): Promise<string> {
  if (!value) return '';
  
  // Convert string to lowercase and trim whitespace as per Facebook requirements
  const normalized = value.toLowerCase().trim();
  
  // Use Web Crypto API to generate SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Store fbclid parameter from URL
 * This helps with better attribution tracking
 */
export function captureFBClid(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  
  if (fbclid) {
    localStorage.setItem('fbclid', fbclid);
    localStorage.setItem('fbclid_timestamp', Date.now().toString());
  }
}

/**
 * Get stored fbclid if it exists and is recent (within 7 days)
 */
function getStoredFBClid(): string | null {
  const fbclid = localStorage.getItem('fbclid');
  const timestamp = localStorage.getItem('fbclid_timestamp');
  
  if (fbclid && timestamp) {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (parseInt(timestamp) > sevenDaysAgo) {
      return fbclid;
    } else {
      // Clean up old fbclid
      localStorage.removeItem('fbclid');
      localStorage.removeItem('fbclid_timestamp');
    }
  }
  
  return null;
}

/**
 * Get user data for Advanced Matching
 * Hashes sensitive information before sending
 */
async function getAdvancedMatchingData(userData?: {
  email?: string;
  fullName?: string;
  phone?: string;
  userId?: string | number;
}): Promise<any> {
  const advancedMatching: any = {};
  
  if (userData?.email) {
    advancedMatching.em = await hashValue(userData.email);
  }
  
  if (userData?.fullName) {
    // Split full name into first and last name
    const nameParts = userData.fullName.trim().split(/\s+/);
    if (nameParts.length > 0) {
      advancedMatching.fn = await hashValue(nameParts[0]);
    }
    if (nameParts.length > 1) {
      advancedMatching.ln = await hashValue(nameParts[nameParts.length - 1]);
    }
  }
  
  if (userData?.phone) {
    // Remove non-numeric characters from phone
    const cleanPhone = userData.phone.replace(/\D/g, '');
    if (cleanPhone) {
      advancedMatching.ph = await hashValue(cleanPhone);
    }
  }
  
  if (userData?.userId) {
    // external_id doesn't need to be hashed
    advancedMatching.external_id = userData.userId.toString();
  }
  
  // Add fbclid if available
  const fbclid = getStoredFBClid();
  if (fbclid) {
    advancedMatching.fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  
  return advancedMatching;
}

/**
 * Initialize Facebook Pixel
 * Call this on app load to capture fbclid
 */
export function initFacebookPixel(): void {
  // Capture fbclid from URL if present
  captureFBClid();
  
  // Track page view is already handled in index.html
  console.log('Facebook Pixel initialized');
}

/**
 * Track CompleteRegistration event
 * Called when a user successfully creates an account
 */
export async function trackCompleteRegistration(userData: {
  email: string;
  fullName?: string;
  userId?: string | number;
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(userData);
    
    window.fbq('track', 'CompleteRegistration', {
      value: 0.00,
      currency: 'BRL',
      content_name: 'user_registration',
      status: 'completed',
      ...advancedMatching,
      eventID: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Unique event ID for deduplication
    });
    
    console.log('CompleteRegistration event tracked successfully');
  } catch (error) {
    console.error('Error tracking CompleteRegistration:', error);
  }
}

/**
 * Track InitiateCheckout event
 * Called when PIX payment is generated
 */
export async function trackInitiateCheckout(params: {
  value: number;
  type: 'premium' | 'credits' | 'authorization' | 'pix_key_auth';
  transactionId?: string;
  userData?: {
    email?: string;
    fullName?: string;
    userId?: string | number;
  };
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(params.userData);
    
    const eventData = {
      value: params.value,
      currency: 'BRL',
      content_type: 'product',
      content_ids: [params.type],
      content_name: params.type,
      num_items: 1,
      transaction_id: params.transactionId
    };
    
    window.fbq('track', 'InitiateCheckout', {
      ...eventData,
      ...advancedMatching,
      eventID: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    console.log('InitiateCheckout event tracked successfully:', params.type, params.value);
  } catch (error) {
    console.error('Error tracking InitiateCheckout:', error);
  }
}

/**
 * Track Purchase event
 * Called when payment is confirmed (status === 'approved')
 */
export async function trackPurchase(params: {
  value: number;
  type: 'premium' | 'credits' | 'authorization' | 'pix_key_auth';
  transactionId?: string;
  userData?: {
    email?: string;
    fullName?: string;
    userId?: string | number;
  };
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(params.userData);
    
    const eventData = {
      value: params.value,
      currency: 'BRL',
      content_type: 'product',
      content_ids: [params.type],
      content_name: params.type,
      num_items: 1,
      transaction_id: params.transactionId
    };
    
    window.fbq('track', 'Purchase', {
      ...eventData,
      ...advancedMatching,
      eventID: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    console.log('Purchase event tracked successfully:', params.type, params.value);
  } catch (error) {
    console.error('Error tracking Purchase:', error);
  }
}

/**
 * Track AddToCart event (optional, can be used for adding credits)
 */
export async function trackAddToCart(params: {
  value: number;
  type: string;
  userData?: {
    email?: string;
    fullName?: string;
    userId?: string | number;
  };
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(params.userData);
    
    const eventData = {
      value: params.value,
      currency: 'BRL',
      content_type: 'product',
      content_ids: [params.type],
      content_name: params.type,
      num_items: 1
    };
    
    window.fbq('track', 'AddToCart', {
      ...eventData,
      ...advancedMatching,
      eventID: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    console.log('AddToCart event tracked successfully:', params.type, params.value);
  } catch (error) {
    console.error('Error tracking AddToCart:', error);
  }
}

/**
 * Track ViewContent event (optional, for specific page views)
 */
export async function trackViewContent(params: {
  contentName: string;
  contentType?: string;
  userData?: {
    email?: string;
    fullName?: string;
    userId?: string | number;
  };
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(params.userData);
    
    const eventData = {
      content_name: params.contentName,
      content_type: params.contentType || 'page',
      value: 0.00,
      currency: 'BRL'
    };
    
    window.fbq('track', 'ViewContent', {
      ...eventData,
      ...(params.userData ? advancedMatching : {})
    });
    
    console.log('ViewContent event tracked successfully:', params.contentName);
  } catch (error) {
    console.error('Error tracking ViewContent:', error);
  }
}

/**
 * Track Lead event (optional, for user actions showing interest)
 */
export async function trackLead(params: {
  value?: number;
  leadType: string;
  userData?: {
    email?: string;
    fullName?: string;
    userId?: string | number;
  };
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(params.userData);
    
    const eventData = {
      value: params.value || 0.00,
      currency: 'BRL',
      content_name: params.leadType
    };
    
    window.fbq('track', 'Lead', {
      ...eventData,
      ...(params.userData ? advancedMatching : {})
    });
    
    console.log('Lead event tracked successfully:', params.leadType);
  } catch (error) {
    console.error('Error tracking Lead:', error);
  }
}

/**
 * Track custom event
 */
export async function trackCustomEvent(params: {
  eventName: string;
  eventData?: any;
  userData?: {
    email?: string;
    fullName?: string;
    userId?: string | number;
  };
}): Promise<void> {
  if (typeof window === 'undefined' || !window.fbq) {
    console.log('Facebook Pixel not available');
    return;
  }
  
  try {
    const advancedMatching = await getAdvancedMatchingData(params.userData);
    
    window.fbq('trackCustom', params.eventName, {
      ...(params.eventData || {}),
      ...(params.userData ? advancedMatching : {})
    });
    
    console.log('Custom event tracked successfully:', params.eventName);
  } catch (error) {
    console.error('Error tracking custom event:', error);
  }
}