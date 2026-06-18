import { Platform } from 'react-native';
import { API_URL } from '../constant/config';

/**
 * Utility to resolve and normalize image URLs from the backend.
 * Handles:
 * - Private S3 URLs → routes through /api/media/proxy for signed access
 * - Localhost replacement for real devices / emulators
 * - Local file paths (adds file://)
 * - JSON strings (e.g. '{"url": "..."}' or '{"front": "..."}')
 * - Objects (e.g. { url: "..." })
 * - Null/Undefined/Placeholder values
 */
export const resolveImageUrl = (img: any): string | undefined => {
  if (!img) return undefined;

  let resolved: string | undefined;

  // 1. Handle Objects — extract URL from common field names
  if (typeof img === 'object') {
    const url = img.url || img.front || img.photo || img.uri || img.preview || img.image_url;
    if (url) return resolveImageUrl(url);
    return undefined;
  }

  // 2. Handle Strings
  if (typeof img === 'string') {
    const trimmed = img.trim();
    
    // Check for explicit null/undefined strings
    if (
      trimmed === '' || 
      trimmed.toLowerCase() === 'null' || 
      trimmed.toLowerCase() === 'undefined'
    ) {
      return undefined;
    }

    // Try to parse if it looks like JSON
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        return resolveImageUrl(parsed.url || parsed.front || parsed.photo || parsed.uri || parsed.image_url || trimmed);
      } catch (e) {
        // Not valid JSON, continue as string
      }
    }

    resolved = trimmed;
  }

  if (!resolved) return undefined;

  // 3. Handle HTTP(S) URLs
  if (resolved.startsWith('http')) {
    // 🔑 KEY FIX: Private S3 URLs must go through the backend media proxy
    // Direct S3 URLs won't load — the bucket is private and requires signed access.
    // The backend has GET /api/media/proxy?url=<s3_url> which redirects to a signed URL.
    if (resolved.includes('.s3.') && resolved.includes('amazonaws.com') && !resolved.includes('/api/media/proxy')) {
      const baseApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      return `${baseApiUrl}/api/media/proxy?url=${encodeURIComponent(resolved)}`;
    }

    // Localhost replacement for real devices and emulators
    if (resolved.includes('localhost')) {
      const urlParts = API_URL.split('/');
      if (urlParts.length >= 3) {
        const baseUrl = urlParts[0] + '//' + urlParts[2];
        resolved = resolved.replace(/https?:\/\/localhost(:\d+)?/, baseUrl);
      } else if (Platform.OS === 'android') {
        resolved = resolved.replace('localhost', '10.0.2.2');
      }
    }
    return resolved;
  }

  // 4. Handle local file paths  
  if (resolved.startsWith('file://') || resolved.startsWith('content://') || resolved.startsWith('data:')) {
    return resolved;
  }

  // 5. Handle absolute local paths (e.g. /data/... on Android, /Users/... on iOS sim)
  if (resolved.startsWith('/')) {
    if (!resolved.startsWith('/data/') && !resolved.startsWith('/Users/') && !resolved.startsWith('/var/')) {
       const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
       return `${baseUrl}${resolved}`;
    }
    return 'file://' + resolved;
  }

  // 6. Default fallback
  return resolved;
};

/**
 * Utility to extract multiple image URLs (e.g. front and back)
 * Returns an array of resolved URLs.
 */
export const resolveAllImageUrls = (img: any): string[] => {
  if (!img) return [];

  const urls: string[] = [];

  // Helper to add if valid
  const addUrl = (url: any) => {
    const resolved = resolveImageUrl(url);
    if (resolved && !urls.includes(resolved)) {
      urls.push(resolved);
    }
  };

  if (typeof img === 'object') {
    // Check specific keys
    if (img.front) addUrl(img.front);
    if (img.back) addUrl(img.back);
    // If no front/back, maybe it's just a single url or we grab what we can
    if (urls.length === 0) {
      if (img.url) addUrl(img.url);
      else if (img.photo) addUrl(img.photo);
      else if (img.uri) addUrl(img.uri);
      else if (img.preview) addUrl(img.preview);
      else if (img.image_url) addUrl(img.image_url);
    }
    return urls;
  }

  if (typeof img === 'string') {
    const trimmed = img.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.front) addUrl(parsed.front);
        if (parsed.back) addUrl(parsed.back);
        if (urls.length === 0) {
           addUrl(parsed.url || parsed.photo || parsed.uri || parsed.image_url || trimmed);
        }
        return urls;
      } catch (e) {
        // Not valid JSON
      }
    }
    // It's just a string, try resolving it as one
    addUrl(trimmed);
  }

  return urls;
};

