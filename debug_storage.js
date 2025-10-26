const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");

module.exports = async function(callback) {
    try {
        console.log("🔍 Testing Storage Operations");
        console.log("=============================");
        
        const paa = await PatientAccessControl.deployed();
        const cm = await ConsentManager.deployed();
        
        const accounts = await web3.eth.getAccounts();
        const patient = accounts[1];
        const providerB = accounts[3];
        
        console.log("Patient:", patient);
        console.log("Provider B:", providerB);
        console.log("");
        
        // Check current consent counter
        const currentCounter = await cm.consentCounter();
        console.log("Current consent counter:", currentCounter.toString());
        
        // Check if consent already exists
        const existingConsent = await cm.getConsent(patient, providerB);
        console.log("Existing consent active:", existingConsent.active);
        console.log("");
        
        // Try to grant consent with gas estimation
        console.log("Estimating gas for grantConsent...");
        try {
            const gasEstimate = await cm.grantConsent.estimateGas(providerB, 1, 0, { from: patient });
            console.log("Gas estimate:", gasEstimate.toString());
        } catch (error) {
            console.log("Gas estimation failed:", error.message);
        }
        
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
