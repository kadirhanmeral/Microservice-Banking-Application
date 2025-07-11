// JWT token utility functions - Simplified version
const base64Decode = (str) => {
  try {
    // Replace URL-safe characters and add padding
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    // Use window.atob for browser environment with proper UTF-8 handling
    if (typeof window !== 'undefined' && window.atob) {
      const binaryString = window.atob(padded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }
    
    // Fallback for Node.js environment
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8');
    }
    
    throw new Error('No base64 decoder available');
  } catch (error) {
    console.error('Base64 decode error:', error);
    return null;
  }
};

export const decodeJWT = (token) => {
  try {
    console.log("🔍 Starting JWT decode for token length:", token ? token.length : 0);
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    console.log("🔍 JWT parts count:", parts.length);
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format - expected 3 parts, got:', parts.length);
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    console.log("🔍 Payload length:", payload.length);
    
    const decodedPayload = base64Decode(payload);
    
    if (!decodedPayload) {
      console.error('Failed to decode JWT payload');
      return null;
    }
    
    const parsed = JSON.parse(decodedPayload);
    console.log("🔍 Successfully decoded JWT payload:", Object.keys(parsed));
    return parsed;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const getEmailFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (decoded) {
    // Try different possible email fields from the JWT
    return decoded.email || decoded.preferred_username || decoded.sub;
  }
  return null;
};

export const getSubFromToken = (token) => {
  try {
    if (!token) {
      console.log("No token provided to getSubFromToken");
      return null;
    }
    
    const decoded = decodeJWT(token);
    if (decoded && decoded.sub) {
      console.log("Successfully extracted sub from token:", decoded.sub);
      return decoded.sub;
    } else {
      console.log("No sub found in decoded token:", decoded);
      return null;
    }
  } catch (error) {
    console.error("Error in getSubFromToken:", error);
    return null;
  }
};

// Helper function to clean and decode text that might have encoding issues
const cleanText = (text) => {
  if (!text) return text;
  
  try {
    // Try to decode URI components first
    return decodeURIComponent(escape(text));
  } catch (e) {
    // If that fails, try to fix common encoding issues
    return text
      .replace(/Ã¶/g, 'ö')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ã§/g, 'ç')
      .replace(/Ä±/g, 'ı')
      .replace(/ÄŸ/g, 'ğ')
      .replace(/ÅŸ/g, 'ş')
      .replace(/Ã–/g, 'Ö')
      .replace(/Ãœ/g, 'Ü')
      .replace(/Ã‡/g, 'Ç')
      .replace(/Ä°/g, 'İ')
      .replace(/Äž/g, 'Ğ')
      .replace(/Åž/g, 'Ş');
  }
};

export const getUserInfoFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (decoded) {
    return {
      email: decoded.email || decoded.preferred_username,
      name: cleanText(decoded.name),
      given_name: cleanText(decoded.given_name),
      family_name: cleanText(decoded.family_name),
      sub: decoded.sub
    };
  }
  return null;
};

export const getRolesFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (decoded) {
    // Try different possible role fields from the JWT
    return decoded.roles || decoded.realm_access?.roles || decoded.resource_access?.account?.roles || [];
  }
  return [];
};

export const isAdminOrManager = (token) => {
  const roles = getRolesFromToken(token);
  console.log("🔍 User roles from token:", roles);
  return roles.some(role => 
    role.toLowerCase().includes('admin') || 
    role.toLowerCase().includes('manager') ||
    role.toLowerCase().includes('staff')
  );
}; 