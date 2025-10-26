const Web3 = require('web3');
require('dotenv').config();

// Configure Web3 connection
const GANACHE_HOST = process.env.GANACHE_HOST || '127.0.0.1';
const GANACHE_PORT = process.env.GANACHE_PORT || 7545;

let web3;

try {
  // Initialize Web3 provider
  web3 = new Web3(new Web3.providers.HttpProvider(`http://${GANACHE_HOST}:${GANACHE_PORT}`));
  
  console.log('✅ Web3 connected to Ganache');
} catch (error) {
  console.error('❌ Failed to connect to Ganache:', error.message);
}

// Contract ABIs (will be loaded from build artifacts)
let contractInstances = {
  accessControl: null,
  consentManager: null,
  dataRegistry: null,
  auditLog: null
};

// Contract addresses (will be set after deployment)
const contractAddresses = {
  accessControl: process.env.ACCESS_CONTROL_ADDRESS || '',
  consentManager: process.env.CONSENT_MANAGER_ADDRESS || '',
  dataRegistry: process.env.DATA_REGISTRY_ADDRESS || '',
  auditLog: process.env.AUDIT_LOG_ADDRESS || ''
};

module.exports = {
  web3,
  contractInstances,
  contractAddresses
};

