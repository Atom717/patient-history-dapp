const fs = require('fs');
const path = require('path');
const { web3, contractInstances } = require('../config/web3');

/**
 * Load contract artifact and create instance
 * @param {string} contractName - Name of the contract
 * @returns {object} Contract instance
 */
function loadContract(contractName) {
  try {
    const artifactPath = path.join(__dirname, '../../build/contracts', `${contractName}.json`);
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Contract artifact not found: ${artifactPath}`);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Get contract address from environment or default
    const networkId = Object.keys(artifact.networks)[0];
    const contractAddress = artifact.networks[networkId]?.address;
    
    if (!contractAddress) {
      throw new Error(`Contract ${contractName} not deployed on network ${networkId}`);
    }
    
    return new web3.eth.Contract(artifact.abi, contractAddress);
  } catch (error) {
    console.error(`Error loading contract ${contractName}:`, error.message);
    throw error;
  }
}

/**
 * Initialize all contracts
 */
function initializeContracts() {
  try {
    contractInstances.accessControl = loadContract('AccessControl');
    contractInstances.consentManager = loadContract('ConsentManager');
    contractInstances.dataRegistry = loadContract('DataRegistry');
    contractInstances.auditLog = loadContract('AuditLog');
    
    console.log('✅ All contracts loaded successfully');
    return contractInstances;
  } catch (error) {
    console.error('❌ Failed to initialize contracts:', error.message);
    return null;
  }
}

module.exports = {
  loadContract,
  initializeContracts,
  contractInstances
};

