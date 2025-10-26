const crypto = require('crypto');

/**
 * Encrypt FHIR bundle using AES-256-GCM
 * @param {object} fhirBundle - FHIR bundle to encrypt
 * @param {string} key - Encryption key (32 bytes)
 * @returns {object} Encrypted data { encrypted, iv, tag }
 */
function encryptFHIRBundle(fhirBundle, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  
  const dataString = JSON.stringify(fhirBundle);
  let encrypted = cipher.update(dataString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: authTag.toString('hex')
  };
}

/**
 * Decrypt FHIR bundle
 * @param {object} encryptedData - Encrypted data { encrypted, iv, tag }
 * @param {string} key - Decryption key (32 bytes)
 * @returns {object} Decrypted FHIR bundle
 */
function decryptFHIRBundle(encryptedData, key) {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipheriv(
    algorithm, 
    Buffer.from(key, 'hex'), 
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

/**
 * Generate encryption key from patient ID
 * @param {string} patientId - Patient identifier
 * @returns {string} Hex-encoded key (64 characters)
 */
function generateKeyFromPatientId(patientId) {
  const hash = crypto.createHash('sha256');
  hash.update(patientId);
  return hash.digest('hex');
}

/**
 * Generate random encryption key
 * @returns {string} Random hex key (64 characters)
 */
function generateRandomKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encryptFHIRBundle,
  decryptFHIRBundle,
  generateKeyFromPatientId,
  generateRandomKey
};

