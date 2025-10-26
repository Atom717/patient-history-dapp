const { web3, contractInstances } = require('../config/web3');
const { loadContract, initializeContracts } = require('../utils/contractLoader');

// Initialize contracts when module loads
let contracts = null;

async function getContracts() {
  if (!contracts) {
    contracts = initializeContracts();
  }
  return contracts;
}

/**
 * Assign a role to an address
 */
async function assignRole(address, role) {
  try {
    const contracts = await getContracts();
    const roleBytes = '0x' + role.padStart(64, '0');
    
    const result = await contracts.accessControl.methods.assignRole(address, roleBytes).send({
      from: web3.eth.defaultAccount,
      gas: 100000
    });
    
    return result;
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
}

/**
 * Grant consent to a provider
 */
async function grantConsent(patientAddress, providerAddress, permissions, expiry) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.consentManager.methods.grantConsent(
      providerAddress,
      permissions,
      expiry
    ).send({
      from: patientAddress,
      gas: 150000
    });
    
    return result;
  } catch (error) {
    console.error('Error granting consent:', error);
    throw error;
  }
}

/**
 * Revoke consent
 */
async function revokeConsent(patientAddress, providerAddress) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.consentManager.methods.revokeConsent(providerAddress).send({
      from: patientAddress,
      gas: 150000
    });
    
    return result;
  } catch (error) {
    console.error('Error revoking consent:', error);
    throw error;
  }
}

/**
 * Check consent
 */
async function checkConsent(patientAddress, providerAddress, permission) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.consentManager.methods.checkConsent(
      patientAddress,
      providerAddress,
      permission
    ).call();
    
    return result;
  } catch (error) {
    console.error('Error checking consent:', error);
    throw error;
  }
}

/**
 * Register data hash
 */
async function registerData(providerAddress, fhirBundleHash, storagePointer, patientId) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.dataRegistry.methods.registerData(
      fhirBundleHash,
      storagePointer,
      patientId
    ).send({
      from: providerAddress,
      gas: 200000
    });
    
    return result;
  } catch (error) {
    console.error('Error registering data:', error);
    throw error;
  }
}

/**
 * Verify data integrity
 */
async function verifyIntegrity(patientId, hash) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.dataRegistry.methods.verifyIntegrity(patientId, hash).call();
    return result;
  } catch (error) {
    console.error('Error verifying integrity:', error);
    throw error;
  }
}

/**
 * Get data entries for a patient
 */
async function getDataEntries(patientId) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.dataRegistry.methods.getDataEntries(patientId).call();
    return result;
  } catch (error) {
    console.error('Error getting data entries:', error);
    throw error;
  }
}

/**
 * Log access event
 */
async function logAccess(patientId, dataHash, actionType, actionDescription) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.auditLog.methods.logAccess(
      patientId,
      dataHash,
      actionType,
      actionDescription
    ).send({
      from: web3.eth.defaultAccount,
      gas: 100000
    });
    
    return result;
  } catch (error) {
    console.error('Error logging access:', error);
    throw error;
  }
}

/**
 * Get audit trail
 */
async function getAuditTrail(patientId) {
  try {
    const contracts = await getContracts();
    
    const result = await contracts.auditLog.methods.getAuditTrail(patientId).call();
    return result;
  } catch (error) {
    console.error('Error getting audit trail:', error);
    throw error;
  }
}

module.exports = {
  assignRole,
  grantConsent,
  revokeConsent,
  checkConsent,
  registerData,
  verifyIntegrity,
  getDataEntries,
  logAccess,
  getAuditTrail
};

