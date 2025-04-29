/**
 * Extract the base filename from a path or URL
 */
export function extractFilename(path: string): string {
  // Remove query parameters if any
  const pathWithoutQuery = path.split('?')[0];
  
  // Extract the filename
  const parts = pathWithoutQuery.split('/');
  const filename = parts[parts.length - 1];
  
  return filename;
}

/**
 * Format bytes to a human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
