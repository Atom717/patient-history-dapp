const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");

module.exports = async function(callback) {
    try {
        console.log("🔍 Debugging Role Assignments");
        console.log("=============================");
        
        const paa = await PatientAccessControl.deployed();
        const cm = await ConsentManager.deployed();
        
        const accounts = await web3.eth.getAccounts();
        const patient = accounts[1];
        const providerB = accounts[3];
        
        console.log("Patient:", patient);
        console.log("Provider B:", providerB);
        console.log("");
        
        // Check roles
        const patientRole = await paa.getUserRole(patient);
        const providerRole = await paa.getUserRole(providerB);
        
        console.log("Patient role:", patientRole.toString());
        console.log("Provider B role:", providerRole.toString());
        console.log("");
        
        // Check role constants
        const PATIENT_ROLE = await paa.PATIENT_ROLE();
        const PROVIDER_ROLE = await paa.PROVIDER_ROLE();
        
        console.log("PATIENT_ROLE constant:", PATIENT_ROLE.toString());
        console.log("PROVIDER_ROLE constant:", PROVIDER_ROLE.toString());
        console.log("");
        
        // Check if roles match
        console.log("Patient has PATIENT_ROLE:", patientRole.toString() === PATIENT_ROLE.toString());
        console.log("Provider B has PROVIDER_ROLE:", providerRole.toString() === PROVIDER_ROLE.toString());
        console.log("");
        
        // Try to grant consent
        console.log("Attempting to grant consent...");
        try {
            const tx = await cm.grantConsent(providerB, 1, 0, { from: patient });
            console.log("✅ Consent granted:", tx.tx);
        } catch (error) {
            console.log("❌ Error:", error.message);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
    
    callback();
};
