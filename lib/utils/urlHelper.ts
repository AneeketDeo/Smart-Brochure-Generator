/**
 * Normalize URL to ensure it has a protocol
 * If the URL doesn't start with http:// or https://, it adds https://
 */
export function normalizeUrl(url: string): string {
  if (!url) return url
  
  // Remove any whitespace
  url = url.trim()
  
  // If it already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If it starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`
  }
  
  // Otherwise, add https://
  return `https://${url}`
}

