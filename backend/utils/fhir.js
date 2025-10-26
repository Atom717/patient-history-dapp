const crypto = require('crypto');

/**
 * Generate SHA-256 hash of a FHIR bundle
 * @param {object} fhirBundle - FHIR bundle object
 * @returns {string} SHA-256 hash (hex string, 64 characters)
 */
function generateHash(fhirBundle) {
  const bundleString = JSON.stringify(fhirBundle);
  const hash = crypto.createHash('sha256');
  hash.update(bundleString);
  return hash.digest('hex');
}

/**
 * Validate FHIR bundle structure
 * @param {object} fhirBundle - FHIR bundle to validate
 * @returns {boolean} True if valid
 */
function validateFHIRBundle(fhirBundle) {
  try {
    if (!fhirBundle || typeof fhirBundle !== 'object') {
      return false;
    }
    
    // Basic FHIR Bundle validation
    if (fhirBundle.resourceType !== 'Bundle') {
      return false;
    }
    
    if (!Array.isArray(fhirBundle.entry)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Create a sample FHIR Patient resource
 * @param {string} patientId - Patient identifier
 * @param {string} name - Patient name
 * @returns {object} FHIR Patient resource
 */
function createPatientResource(patientId, name) {
  return {
    resourceType: 'Patient',
    id: patientId,
    identifier: [{
      system: 'http://example.com/patient-id',
      value: patientId
    }],
    name: [{
      given: [name],
      use: 'official'
    }],
    birthDate: '1990-01-01',
    gender: 'unknown'
  };
}

/**
 * Create a sample FHIR Observation resource
 * @param {string} patientId - Patient reference
 * @param {string} status - Observation status
 * @param {object} value - Observation value
 * @returns {object} FHIR Observation resource
 */
function createObservationResource(patientId, status, value) {
  return {
    resourceType: 'Observation',
    status: status || 'final',
    subject: {
      reference: `Patient/${patientId}`
    },
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: '85354-9',
        display: 'Blood pressure panel'
      }]
    },
    valueQuantity: value || {
      value: 120,
      unit: 'mmHg'
    }
  };
}

/**
 * Create a sample FHIR Bundle
 * @param {string} patientId - Patient identifier
 * @param {string} patientName - Patient name
 * @param {array} observations - Array of observation data
 * @returns {object} FHIR Bundle
 */
function createFHIRBundle(patientId, patientName, observations = []) {
  const patient = createPatientResource(patientId, patientName);
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: patient
      }
    ]
  };
  
  // Add observation resources
  observations.forEach((obs, index) => {
    bundle.entry.push({
      resource: createObservationResource(patientId, obs.status, obs.value)
    });
  });
  
  return bundle;
}

/**
 * Create a sample FHIR Condition resource
 * @param {string} patientId - Patient reference
 * @param {string} condition - Condition text
 * @returns {object} FHIR Condition resource
 */
function createConditionResource(patientId, condition) {
  return {
    resourceType: 'Condition',
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'active',
        display: 'Active'
      }]
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    code: {
      text: condition
    },
    onsetDateTime: new Date().toISOString()
  };
}

module.exports = {
  generateHash,
  validateFHIRBundle,
  createPatientResource,
  createObservationResource,
  createConditionResource,
  createFHIRBundle
};

