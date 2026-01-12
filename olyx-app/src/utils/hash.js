/**
 * Hash a string using SHA-256
 * Used for hashing secret answers (not passwords - Supabase handles those)
 */
export async function hashSHA256(text) {
  const msgBuffer = new TextEncoder().encode(text.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Validate email is a Gmail address
 */
export function isGmailAddress(email) {
  return email.toLowerCase().endsWith('@gmail.com')
}

/**
 * Validate password meets requirements (minimum 8 characters)
 */
export function isValidPassword(password) {
  return password.length >= 8
}
