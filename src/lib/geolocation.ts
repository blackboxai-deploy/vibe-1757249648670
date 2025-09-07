import { LocationData } from '@/types/tracking';

// Get client IP from request headers
export function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const headers = request.headers;
  
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }
  
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP;
  }
  
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to remote address or localhost for development
  return headers.get('x-forwarded-for') || '127.0.0.1';
}

// Lookup location data from IP address using free ipapi.co service
export async function getLocationFromIP(ipAddress: string): Promise<LocationData | null> {
  // Skip localhost and private IPs
  if (
    ipAddress === '127.0.0.1' ||
    ipAddress === 'localhost' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.') ||
    ipAddress === '::1'
  ) {
    return {
      country: 'Local',
      region: 'Development',
      city: 'Localhost',
      latitude: 0,
      longitude: 0
    };
  }

  try {
    // Use ipapi.co free service (1000 requests per day, no API key required)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    
    if (!response.ok) {
      console.error('Geolocation API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Handle error responses from the API
    if (data.error) {
      console.error('Geolocation error:', data.reason);
      return null;
    }
    
    return {
      country: data.country_name || undefined,
      region: data.region || undefined,
      city: data.city || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

// Generate a random short code for tracking links
export function generateShortCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate URL format
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Format location for display
export function formatLocation(visit: { country?: string; region?: string; city?: string }): string {
  const parts = [];
  if (visit.city) parts.push(visit.city);
  if (visit.region) parts.push(visit.region);
  if (visit.country) parts.push(visit.country);
  return parts.join(', ') || 'Unknown Location';
}

// Get user agent info
export function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  const ua = userAgent.toLowerCase();
  
  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // OS detection
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios')) os = 'iOS';
  
  // Device detection
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet')) device = 'Tablet';
  
  return { browser, os, device };
}