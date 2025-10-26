const ConsentManager = artifacts.require("ConsentManager");

module.exports = async function(callback) {
    try {
        console.log("Testing ConsentManager contract...");
        
        // Get deployed instance
        const consentManager = await ConsentManager.deployed();
        console.log("Contract deployed at:", consentManager.address);
        
        // Get accounts
        const accounts = await web3.eth.getAccounts();
        const patient = accounts[1];
        const provider = accounts[2];
        
        console.log("Patient:", patient);
        console.log("Provider:", provider);
        
        // Check if grantConsent method exists
        console.log("Available methods:", Object.getOwnPropertyNames(consentManager));
        
        // Try to call grantConsent
        console.log("Attempting to grant consent...");
        const tx = await consentManager.grantConsent(provider, 1, 0, { from: patient });
        console.log("Consent granted! Transaction:", tx.tx);
        
        // Check consent
        const hasConsent = await consentManager.checkConsent(patient, provider, 1);
        console.log("Has consent:", hasConsent);
        
    } catch (error) {
        console.error("Error:", error.message);
    }
    
    callback();
};
