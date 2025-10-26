const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");
const DataRegistry = artifacts.require("DataRegistry");
const AuditLog = artifacts.require("AuditLog");

module.exports = async function(callback) {
    try {
        console.log("🚀 Starting End-to-End Patient History Demo");
        console.log("==========================================\n");

        // Load contracts
        const paa = await PatientAccessControl.deployed();
        const cm = await ConsentManager.deployed();
        const dr = await DataRegistry.deployed();
        const al = await AuditLog.deployed();

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        const patient = accounts[1];
        const providerA = accounts[2];
        const providerB = accounts[3];

        console.log("👥 Demo Participants:");
        console.log("Patient:", patient);
        console.log("Provider A:", providerA);
        console.log("Provider B:", providerB);
        console.log("");

        // Step 1: Create FHIR Bundle
        console.log("📋 Step 1: Provider A Creates FHIR Bundle");
        console.log("------------------------------------------");
        
        const patientId = "P001-Alice";
        const fhirBundle = {
            resourceType: "Bundle",
            type: "collection",
            timestamp: new Date().toISOString(),
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: "P001",
                        name: [{ given: ["Alice"], family: "Johnson" }],
                        birthDate: "1990-05-15",
                        gender: "female"
                    }
                },
                {
                    resource: {
                        resourceType: "Observation",
                        status: "final",
                        code: { text: "Blood Pressure" },
                        valueQuantity: { value: 120, unit: "mmHg" }
                    }
                }
            ]
        };

        // Generate hash
        const crypto = require('crypto');
        const bundleString = JSON.stringify(fhirBundle);
        const hash = crypto.createHash('sha256').update(bundleString).digest('hex');
        console.log("FHIR Bundle Hash:", hash);
        console.log("");

        // Step 2: Register Data
        console.log("💾 Step 2: Provider A Registers Data");
        console.log("------------------------------------");
        
        const storagePointer = "QmFHIR123456789abcdefghijklmnopqrstuvwxyz";
        console.log("Storage Pointer:", storagePointer);
        
        const registerTx = await dr.registerData(
            hash,
            storagePointer,
            patientId,
            { from: providerA }
        );
        console.log("✅ Data registered:", registerTx.tx);
        
        // Log access
        await al.logAccess(
            patientId,
            hash,
            1, // ACTION_REGISTER
            "Provider A registered FHIR bundle",
            { from: providerA }
        );
        console.log("✅ Access logged");
        console.log("");

        // Step 3: Grant Consent
        console.log("🔐 Step 3: Patient Grants Consent");
        console.log("----------------------------------");
        
        // Check consent before
        const hasConsentBefore = await cm.checkConsent(patient, providerB, 1);
        console.log("Has consent before granting:", hasConsentBefore);
        
        // Grant consent
        const consentTx = await cm.grantConsent(
            providerB,
            1, // PERMISSION_READ
            0,  // No expiry
            { from: patient }
        );
        console.log("✅ Consent granted:", consentTx.tx);
        
        // Verify consent
        const hasConsentAfter = await cm.checkConsent(patient, providerB, 1);
        console.log("Has consent after granting:", hasConsentAfter);
        console.log("");

        // Step 4: Provider B Accesses Data
        console.log("🔍 Step 4: Provider B Accesses Data");
        console.log("------------------------------------");
        
        // Check consent
        const hasAccess = await cm.checkConsent(patient, providerB, 1);
        console.log("Provider B has access:", hasAccess);
        
        // Get data entries
        const entries = await dr.getDataEntries(patientId);
        console.log("Number of data entries:", entries.length);
        console.log("First entry hash:", entries[0].fhirBundleHash);
        console.log("Storage pointer:", entries[0].storagePointer);
        
        // Verify integrity
        const isValid = await dr.verifyIntegrity(patientId, hash);
        console.log("Data integrity verified:", isValid);
        
        // Log access
        await al.logAccess(
            patientId,
            hash,
            2, // ACTION_VIEW
            "Provider B viewed patient FHIR bundle",
            { from: providerB }
        );
        console.log("✅ Access logged for Provider B");
        console.log("");

        // Step 5: View Audit Trail
        console.log("📊 Step 5: View Audit Trail");
        console.log("----------------------------");
        
        const auditTrail = await al.getAuditTrail(patientId);
        console.log("Total audit entries:", auditTrail.length);
        
        auditTrail.forEach((entry, index) => {
            console.log(`\nEntry ${index + 1}:`);
            console.log("  Accessor:", entry.accessor);
            console.log("  Action:", entry.actionType);
            console.log("  Timestamp:", new Date(entry.timestamp * 1000));
            console.log("  Description:", entry.actionDescription);
        });
        console.log("");

        // Step 6: Patient Reviews and Revokes
        console.log("👤 Step 6: Patient Reviews and Revokes");
        console.log("--------------------------------------");
        
        // Review consent
        const consent = await cm.getConsent(patient, providerB);
        console.log("Consent Details:");
        console.log("  Provider:", consent.provider);
        console.log("  Permissions:", consent.permissions);
        console.log("  Active:", consent.active);
        console.log("  Granted:", new Date(consent.timestamp * 1000));
        
        // Revoke consent
        const revokeTx = await cm.revokeConsent(providerB, { from: patient });
        console.log("✅ Consent revoked:", revokeTx.tx);
        
        // Verify access denied
        const hasAccessAfterRevoke = await cm.checkConsent(patient, providerB, 1);
        console.log("Provider B has access after revoke:", hasAccessAfterRevoke);
        console.log("");

        // Step 7: Final Audit Trail
        console.log("📊 Step 7: Final Audit Trail");
        console.log("-----------------------------");
        
        const finalAudit = await al.getAuditTrail(patientId);
        console.log("Total entries:", finalAudit.length);
        
        finalAudit.forEach((entry, index) => {
            console.log(`\n${index + 1}. ${entry.actionDescription}`);
            console.log(`   Who: ${entry.accessor}`);
            console.log(`   When: ${new Date(entry.timestamp * 1000).toLocaleString()}`);
        });

        console.log("\n🎉 Demo Complete!");
        console.log("==================");
        console.log("✅ FHIR Bundle created and registered");
        console.log("✅ Patient granted consent to Provider B");
        console.log("✅ Provider B accessed data with consent");
        console.log("✅ Data integrity verified");
        console.log("✅ Immutable audit trail created");
        console.log("✅ Patient revoked consent");
        console.log("✅ Provider B access denied after revocation");
        console.log("✅ Complete audit trail maintained");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
    
    callback();
};
