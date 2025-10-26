const Migrations = artifacts.require("Migrations");
const AccessControl = artifacts.require("AccessControl");
const ConsentManager = artifacts.require("ConsentManager");
const DataRegistry = artifacts.require("DataRegistry");
const AuditLog = artifacts.require("AuditLog");

module.exports = async function (deployer, network, accounts) {
  console.log('========================================');
  console.log('🚀 Deploying Patient History DApp Contracts');
  console.log('========================================\n');
  
  // Deploy Migrations
  console.log('📝 Deploying Migrations...');
  await deployer.deploy(Migrations);
  console.log('✅ Migrations deployed\n');
  
  // Deploy AccessControl
  console.log('🔐 Deploying AccessControl...');
  await deployer.deploy(AccessControl);
  const accessControl = await AccessControl.deployed();
  console.log('✅ AccessControl deployed at:', accessControl.address);
  
  // Deploy ConsentManager
  console.log('📋 Deploying ConsentManager...');
  await deployer.deploy(ConsentManager);
  const consentManager = await ConsentManager.deployed();
  console.log('✅ ConsentManager deployed at:', consentManager.address);
  
  // Deploy AuditLog
  console.log('📊 Deploying AuditLog...');
  await deployer.deploy(AuditLog, consentManager.address);
  const auditLog = await AuditLog.deployed();
  console.log('✅ AuditLog deployed at:', auditLog.address);
  
  // Deploy DataRegistry
  console.log('💾 Deploying DataRegistry...');
  await deployer.deploy(DataRegistry, consentManager.address);
  const dataRegistry = await DataRegistry.deployed();
  console.log('✅ DataRegistry deployed at:', dataRegistry.address);
  
  // Get role identifiers
  const adminRole = await accessControl.ADMIN_ROLE();
  const patientRole = await accessControl.PATIENT_ROLE();
  const providerRole = await accessControl.PROVIDER_ROLE();
  
  console.log('\n👥 Setting up demo roles...');
  
  // Account 0 is the deployer (already has ADMIN_ROLE)
  console.log(`   Admin: ${accounts[0]} (deployer)`);
  
  // Account 1 is patient
  if (accounts[1]) {
    await accessControl.assignRole(accounts[1], patientRole);
    console.log(`   Patient: ${accounts[1]}`);
  }
  
  // Account 2 is provider
  if (accounts[2]) {
    await accessControl.assignRole(accounts[2], providerRole);
    console.log(`   Provider 1: ${accounts[2]}`);
  }
  
  // Account 3 is another provider
  if (accounts[3]) {
    await accessControl.assignRole(accounts[3], providerRole);
    console.log(`   Provider 2: ${accounts[3]}`);
  }
  
  console.log('\n========================================');
  console.log('✅ Deployment Complete!');
  console.log('========================================\n');
  
  console.log('📋 Contract Addresses:');
  console.log(`   AccessControl:  ${accessControl.address}`);
  console.log(`   ConsentManager: ${consentManager.address}`);
  console.log(`   DataRegistry:  ${dataRegistry.address}`);
  console.log(`   AuditLog:      ${auditLog.address}`);
  
  console.log('\n💡 Next steps:');
  console.log('   1. Start Ganache (if not running)');
  console.log('   2. Run tests: npm run test');
  console.log('   3. Start backend: npm run start:backend');
  console.log('\n');
};

