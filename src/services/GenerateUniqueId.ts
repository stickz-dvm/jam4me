export const generateTimestampUserId = (): string => {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomStr = Math.random().toString(36).substring(2, 8); // Random 6 chars
  return `user_${timestamp}_${randomStr}`;
};

export const generateCryptoUserId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `user_${crypto.randomUUID()}`;
  }

  return generateTimestampUserId()
};

export const generateSecureUserId = async (): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Convert to base64 and make URL-safe
    const base64 = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return `user_${base64}`;
  }
  
  // Fallback
  return generateCryptoUserId();
};
