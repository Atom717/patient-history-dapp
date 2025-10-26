const PatientAccessControl = artifacts.require("PatientAccessControl");

contract("PatientAccessControl", (accounts) => {
  const [admin, patient1, provider1, unauthorized] = accounts;
  let accessControlInstance;

  beforeEach(async () => {
    accessControlInstance = await PatientAccessControl.new();
  });

  describe("Role Assignment", () => {
    it("should assign PATIENT_ROLE to an address", async () => {
      const patientRole = await accessControlInstance.PATIENT_ROLE();
      
      await accessControlInstance.assignRole(patient1, patientRole);
      
      const hasRole = await accessControlInstance.hasRole(patient1, patientRole);
      assert.isTrue(hasRole, "Patient should have PATIENT_ROLE");
    });

    it("should assign PROVIDER_ROLE to an address", async () => {
      const providerRole = await accessControlInstance.PROVIDER_ROLE();
      
      await accessControlInstance.assignRole(provider1, providerRole);
      
      const hasRole = await accessControlInstance.hasRole(provider1, providerRole);
      assert.isTrue(hasRole, "Provider should have PROVIDER_ROLE");
    });

    it("should revoke a role", async () => {
      const patientRole = await accessControlInstance.PATIENT_ROLE();
      
      await accessControlInstance.assignRole(patient1, patientRole);
      await accessControlInstance.revokeRole(patient1);
      
      const userRole = await accessControlInstance.getUserRole(patient1);
      assert.equal(userRole, "0x0000000000000000000000000000000000000000000000000000000000000000", 
        "Role should be revoked");
    });

    it("should reject role assignment by non-admin", async () => {
      const patientRole = await accessControlInstance.PATIENT_ROLE();
      
      try {
        await accessControlInstance.assignRole(patient1, patientRole, { from: unauthorized });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("AccessControl: caller must be an admin"));
      }
    });
  });

  describe("Modifiers", () => {
    it("should allow only patients", async () => {
      const patientRole = await accessControlInstance.PATIENT_ROLE();
      await accessControlInstance.assignRole(patient1, patientRole);
      
      // This would be tested in the actual contracts that use the modifier
      const userRole = await accessControlInstance.getUserRole(patient1);
      assert.equal(userRole, patientRole, "User should have patient role");
    });

    it("should allow only providers", async () => {
      const providerRole = await accessControlInstance.PROVIDER_ROLE();
      await accessControlInstance.assignRole(provider1, providerRole);
      
      const userRole = await accessControlInstance.getUserRole(provider1);
      assert.equal(userRole, providerRole, "User should have provider role");
    });

    it("should allow only admins", async () => {
      const adminRole = await accessControlInstance.ADMIN_ROLE();
      const userRole = await accessControlInstance.getUserRole(admin);
      assert.equal(userRole, adminRole, "Deployer should have admin role");
    });
  });

  describe("Pausable", () => {
    it("should pause the contract", async () => {
      await accessControlInstance.pause();
      const isPaused = await accessControlInstance.paused();
      assert.isTrue(isPaused, "Contract should be paused");
    });

    it("should unpause the contract", async () => {
      await accessControlInstance.pause();
      await accessControlInstance.unpause();
      const isPaused = await accessControlInstance.paused();
      assert.isFalse(isPaused, "Contract should be unpaused");
    });
  });
});

