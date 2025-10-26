const ConsentManager = artifacts.require("ConsentManager");
const PatientAccessControl = artifacts.require("PatientAccessControl");

contract("ConsentManager", (accounts) => {
  const [admin, patient1, provider1, provider2, unauthorized] = accounts;
  let consentInstance;
  let accessControlInstance;
  let patientRole;
  let providerRole;

  beforeEach(async () => {
    // Deploy PatientAccessControl first
    accessControlInstance = await PatientAccessControl.new();
    
    // Deploy ConsentManager with AccessControl reference
    consentInstance = await ConsentManager.new(accessControlInstance.address);
    
    patientRole = await accessControlInstance.PATIENT_ROLE();
    providerRole = await accessControlInstance.PROVIDER_ROLE();
    
    // Setup roles
    await accessControlInstance.assignRole(patient1, patientRole);
    await accessControlInstance.assignRole(provider1, providerRole);
    await accessControlInstance.assignRole(provider2, providerRole);
  });

  describe("Grant Consent", () => {
    it("should allow patient to grant consent with READ permission", async () => {
      const permission = await consentInstance.PERMISSION_READ();
      const expiry = 0; // Indefinite
      
      await consentInstance.grantConsent(provider1, permission, expiry, { from: patient1 });
      
      const hasConsent = await consentInstance.checkConsent(
        patient1, 
        provider1, 
        permission
      );
      assert.isTrue(hasConsent, "Provider should have READ permission");
    });

    it("should allow patient to grant multiple permissions", async () => {
      const readPermission = await consentInstance.PERMISSION_READ();
      const writePermission = await consentInstance.PERMISSION_WRITE();
      const permission = readPermission | writePermission;
      const expiry = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      
      await consentInstance.grantConsent(provider1, permission, expiry, { from: patient1 });
      
      const consent = await consentInstance.getConsent(patient1, provider1);
      assert.equal(consent.permissions, permission.toString(), "Should have both permissions");
    });

    it("should reject consent grant to non-provider", async () => {
      const permission = await consentInstance.PERMISSION_READ();
      
      try {
        await consentInstance.grantConsent(unauthorized, permission, 0, { from: patient1 });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("provider must have PROVIDER_ROLE"));
      }
    });

    it("should reject consent grant from non-patient", async () => {
      const permission = await consentInstance.PERMISSION_READ();
      
      try {
        await consentInstance.grantConsent(provider1, permission, 0, { from: unauthorized });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("AccessControl: caller must be a patient"));
      }
    });
  });

  describe("Revoke Consent", () => {
    it("should allow patient to revoke consent", async () => {
      const permission = await consentInstance.PERMISSION_READ();
      
      await consentInstance.grantConsent(provider1, permission, 0, { from: patient1 });
      await consentInstance.revokeConsent(provider1, { from: patient1 });
      
      const consent = await consentInstance.getConsent(patient1, provider1);
      assert.isFalse(consent.active, "Consent should be revoked");
    });

    it("should reject revocation of non-existent consent", async () => {
      try {
        await consentInstance.revokeConsent(provider1, { from: patient1 });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("consent does not exist"));
      }
    });
  });

  describe("Consent Expiry", () => {
    it("should handle time-bound consent", async () => {
      const permission = await consentInstance.PERMISSION_READ();
      const expiry = Math.floor(Date.now() / 1000) + 100; // 100 seconds from now
      
      await consentInstance.grantConsent(provider1, permission, expiry, { from: patient1 });
      
      const consent = await consentInstance.getConsent(patient1, provider1);
      assert.equal(consent.expiry.toString(), expiry.toString(), "Expiry should be set");
    });
  });

  describe("Update Permissions", () => {
    it("should allow patient to update consent permissions", async () => {
      const readPermission = await consentInstance.PERMISSION_READ();
      
      await consentInstance.grantConsent(provider1, readPermission, 0, { from: patient1 });
      
      const newPermission = await consentInstance.PERMISSION_WRITE();
      await consentInstance.updatePermissions(provider1, newPermission, { from: patient1 });
      
      const consent = await consentInstance.getConsent(patient1, provider1);
      assert.equal(consent.permissions, newPermission.toString(), "Permissions should be updated");
    });
  });
});

