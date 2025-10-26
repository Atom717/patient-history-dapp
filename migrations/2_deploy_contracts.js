const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");
const DataRegistry = artifacts.require("DataRegistry");
const AuditLog = artifacts.require("AuditLog");

module.exports = async function (deployer, network, accounts) {
  console.log('========================================');
  console.log('🚀 Deploying Patient History DApp Contracts');
  console.log('========================================\n');
  
  // Deploy PatientAccessControl first
  console.log('📝 Deploying PatientAccessControl...');
  await deployer.deploy(PatientAccessControl);
  const accessControl = await PatientAccessControl.deployed();
  console.log('✅ PatientAccessControl deployed at:', accessControl.address);

  // Deploy ConsentManager with PatientAccessControl reference
  console.log('📋 Deploying ConsentManager...');
  await deployer.deploy(ConsentManager, accessControl.address);
  const consentManager = await ConsentManager.deployed();
  console.log('✅ ConsentManager deployed at:', consentManager.address);

  // Deploy AuditLog with ConsentManager and PatientAccessControl references
  console.log('📊 Deploying AuditLog...');
  await deployer.deploy(AuditLog, consentManager.address, accessControl.address);
  const auditLog = await AuditLog.deployed();
  console.log('✅ AuditLog deployed at:', auditLog.address);

  // Deploy DataRegistry with ConsentManager and PatientAccessControl references
  console.log('💾 Deploying DataRegistry...');
  await deployer.deploy(DataRegistry, consentManager.address, accessControl.address);
  const dataRegistry = await DataRegistry.deployed();
  console.log('✅ DataRegistry deployed at:', dataRegistry.address);

  // Assign demo roles to accounts
  // Account 0 is the deployer (already has ADMIN_ROLE)
  const adminRole = await accessControl.ADMIN_ROLE();
  const patientRole = await accessControl.PATIENT_ROLE();
  const providerRole = await accessControl.PROVIDER_ROLE();

  console.log('\n👥 Setting up demo roles...');
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
};

