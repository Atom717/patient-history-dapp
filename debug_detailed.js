const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");

module.exports = async function(callback) {
    try {
        console.log("🔍 Detailed Role Debug");
        console.log("======================");
        
        const paa = await PatientAccessControl.deployed();
        const cm = await ConsentManager.deployed();
        
        const accounts = await web3.eth.getAccounts();
        const patient = accounts[1];
        const providerB = accounts[3];
        
        console.log("Patient:", patient);
        console.log("Provider B:", providerB);
        console.log("");
        
        // Check roles step by step
        const patientRole = await paa.getUserRole(patient);
        const providerRole = await paa.getUserRole(providerB);
        
        console.log("Patient role (hex):", patientRole);
        console.log("Provider B role (hex):", providerRole);
        console.log("");
        
        // Check role constants
        const PATIENT_ROLE = await paa.PATIENT_ROLE();
        const PROVIDER_ROLE = await paa.PROVIDER_ROLE();
        
        console.log("PATIENT_ROLE constant (hex):", PATIENT_ROLE);
        console.log("PROVIDER_ROLE constant (hex):", PROVIDER_ROLE);
        console.log("");
        
        // Check if roles match
        console.log("Patient role == PATIENT_ROLE:", patientRole === PATIENT_ROLE);
        console.log("Provider B role == PROVIDER_ROLE:", providerRole === PROVIDER_ROLE);
        console.log("");
        
        // Test the modifier logic manually
        console.log("Testing modifier logic...");
        const patientRoleFromModifier = await paa.getUserRole(patient);
        const patientRoleConstant = await paa.PATIENT_ROLE();
        const modifierCheck = patientRoleFromModifier === patientRoleConstant;
        
        console.log("Modifier check result:", modifierCheck);
        console.log("");
        
        // Try to grant consent with more details
        console.log("Attempting to grant consent...");
        try {
            const tx = await cm.grantConsent(providerB, 1, 0, { from: patient });
            console.log("✅ Consent granted:", tx.tx);
        } catch (error) {
            console.log("❌ Error:", error.message);
            console.log("Error details:", error);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error("Full error:", error);
    }
    
    callback();
};
