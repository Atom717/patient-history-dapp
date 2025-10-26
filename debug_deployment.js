const PatientAccessControl = artifacts.require("PatientAccessControl");
const ConsentManager = artifacts.require("ConsentManager");

module.exports = async function(callback) {
    try {
        console.log("🔍 Checking Contract Deployment");
        console.log("===============================");
        
        const paa = await PatientAccessControl.deployed();
        const cm = await ConsentManager.deployed();
        
        console.log("PatientAccessControl address:", paa.address);
        console.log("ConsentManager address:", cm.address);
        console.log("");
        
        // Check if ConsentManager has the correct accessControl address
        const accessControlAddress = await cm.accessControl();
        console.log("ConsentManager's accessControl address:", accessControlAddress);
        console.log("Addresses match:", accessControlAddress === paa.address);
        console.log("");
        
        // Test a simple function call
        console.log("Testing simple function calls...");
        
        try {
            const patientRole = await paa.PATIENT_ROLE();
            console.log("✅ PATIENT_ROLE call successful:", patientRole);
        } catch (error) {
            console.log("❌ PATIENT_ROLE call failed:", error.message);
        }
        
        try {
            const providerRole = await paa.PROVIDER_ROLE();
            console.log("✅ PROVIDER_ROLE call successful:", providerRole);
        } catch (error) {
            console.log("❌ PROVIDER_ROLE call failed:", error.message);
        }
        
        try {
            const accounts = await web3.eth.getAccounts();
            const patient = accounts[1];
            const userRole = await paa.getUserRole(patient);
            console.log("✅ getUserRole call successful:", userRole);
        } catch (error) {
            console.log("❌ getUserRole call failed:", error.message);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
    
    callback();
};
