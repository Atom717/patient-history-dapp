const DataRegistry = artifacts.require("DataRegistry");
const ConsentManager = artifacts.require("ConsentManager");
const PatientAccessControl = artifacts.require("PatientAccessControl");

contract("DataRegistry", (accounts) => {
  const [admin, patient1, provider1, provider2, unauthorized] = accounts;
  let consentInstance;
  let accessControlInstance;
  let dataRegistryInstance;
  let patientRole;
  let providerRole;

  beforeEach(async () => {
    accessControlInstance = await PatientAccessControl.new();
    consentInstance = await ConsentManager.new(accessControlInstance.address);
    dataRegistryInstance = await DataRegistry.new(consentInstance.address, accessControlInstance.address);
    
    patientRole = await accessControlInstance.PATIENT_ROLE();
    providerRole = await accessControlInstance.PROVIDER_ROLE();
    
    // Setup roles
    await accessControlInstance.assignRole(patient1, patientRole);
    await accessControlInstance.assignRole(provider1, providerRole);
    await accessControlInstance.assignRole(provider2, providerRole);
  });

  describe("Register Data", () => {
    it("should allow provider to register data", async () => {
      const patientId = "P001";
      const hash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const storagePointer = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
      
      await dataRegistryInstance.registerData(
        hash,
        storagePointer,
        patientId,
        { from: provider1 }
      );
      
      const count = await dataRegistryInstance.getDataEntryCount(patientId);
      assert.equal(count, 1, "Should have one data entry");
    });

    it("should prevent duplicate hash registration", async () => {
      const patientId = "P001";
      const hash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const storagePointer = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
      
      await dataRegistryInstance.registerData(hash, storagePointer, patientId, { from: provider1 });
      
      try {
        await dataRegistryInstance.registerData(hash, storagePointer, patientId, { from: provider1 });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("hash already exists"));
      }
    });

    it("should reject data registration from non-provider", async () => {
      const patientId = "P001";
      const hash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const storagePointer = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
      
      try {
        await dataRegistryInstance.registerData(hash, storagePointer, patientId, { from: unauthorized });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("AccessControl: caller must be a provider"));
      }
    });
  });

  describe("Verify Integrity", () => {
    it("should verify existing hash", async () => {
      const patientId = "P001";
      const hash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const storagePointer = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
      
      await dataRegistryInstance.registerData(hash, storagePointer, patientId, { from: provider1 });
      
      const result = await dataRegistryInstance.verifyIntegrity(patientId, hash);
      const verified = typeof result === 'boolean' ? result : result.logs.length > 0;
      assert.isTrue(verified, "Hash should be verified");
    });

    it("should reject non-existent hash", async () => {
      const patientId = "P001";
      const hash = "invalid123456789012345678901234567890abcdef1234567890abcdef123456";
      
      const result = await dataRegistryInstance.verifyIntegrity(patientId, hash);
      const verified = typeof result === 'boolean' ? result : result.logs.length > 0;
      assert.isFalse(verified, "Hash should not be verified");
    });
  });

  describe("Get Data Entries", () => {
    it("should retrieve all data entries for a patient", async () => {
      const patientId = "P001";
      const hash1 = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const hash2 = "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678";
      const storagePointer = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
      
      await dataRegistryInstance.registerData(hash1, storagePointer, patientId, { from: provider1 });
      await dataRegistryInstance.registerData(hash2, storagePointer, patientId, { from: provider1 });
      
      const entries = await dataRegistryInstance.getDataEntries(patientId);
      assert.equal(entries.length, 2, "Should have two entries");
    });
  });

  describe("Deactivate Data Entry", () => {
    it("should allow provider to deactivate their own entry", async () => {
      const patientId = "P001";
      const hash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const storagePointer = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o";
      
      await dataRegistryInstance.registerData(hash, storagePointer, patientId, { from: provider1 });
      await dataRegistryInstance.deactivateDataEntry(patientId, 0, { from: provider1 });
      
      const entry = await dataRegistryInstance.getDataEntry(patientId, 0);
      assert.isFalse(entry.active, "Entry should be deactivated");
    });
  });
});

