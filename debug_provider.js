const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");

module.exports = async function(callback) {
    try {
        console.log("🔍 Testing Provider Role Check");
        console.log("==============================");
        
        const paa = await PatientAccessControl.deployed();
        const cm = await ConsentManager.deployed();
        
        const accounts = await web3.eth.getAccounts();
        const patient = accounts[1];
        const providerB = accounts[3];
        
        console.log("Patient:", patient);
        console.log("Provider B:", providerB);
        console.log("");
        
        // Test the exact check from grantConsent function
        const providerRole = await paa.getUserRole(providerB);
        const PROVIDER_ROLE = await paa.PROVIDER_ROLE();
        
        console.log("Provider B role:", providerRole);
        console.log("PROVIDER_ROLE constant:", PROVIDER_ROLE);
        console.log("Are they equal?", providerRole === PROVIDER_ROLE);
        console.log("");
        
        // Test each require statement individually
        console.log("Testing require statements:");
        
        // 1. Provider not zero address
        console.log("1. Provider != address(0):", providerB !== "0x0000000000000000000000000000000000000000");
        
        // 2. Provider != msg.sender
        console.log("2. Provider != msg.sender:", providerB !== patient);
        
        // 3. Permissions > 0
        console.log("3. Permissions > 0:", 1 > 0);
        
        // 4. Provider has PROVIDER_ROLE
        console.log("4. Provider has PROVIDER_ROLE:", providerRole === PROVIDER_ROLE);
        
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
