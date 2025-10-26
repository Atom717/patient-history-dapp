const AuditLog = artifacts.require("AuditLog");
const ConsentManager = artifacts.require("ConsentManager");
const PatientAccessControl = artifacts.require("PatientAccessControl");

contract("AuditLog", (accounts) => {
  const [admin, patient1, provider1, provider2] = accounts;
  let consentInstance;
  let accessControlInstance;
  let auditLogInstance;
  let patientRole;
  let providerRole;

  beforeEach(async () => {
    accessControlInstance = await PatientAccessControl.new();
    consentInstance = await ConsentManager.new(accessControlInstance.address);
    auditLogInstance = await AuditLog.new(consentInstance.address, accessControlInstance.address);
    
    patientRole = await accessControlInstance.PATIENT_ROLE();
    providerRole = await accessControlInstance.PROVIDER_ROLE();
    
    // Setup roles
    await accessControlInstance.assignRole(patient1, patientRole);
    await accessControlInstance.assignRole(provider1, providerRole);
    await accessControlInstance.assignRole(provider2, providerRole);
  });

  describe("Log Access", () => {
    it("should log an access event", async () => {
      const patientId = "P001";
      const dataHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const actionType = await auditLogInstance.ACTION_VIEW();
      const description = "Viewed patient data";
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        actionType,
        description,
        { from: provider1 }
      );
      
      const trail = await auditLogInstance.getAuditTrail(patientId);
      assert.equal(trail.length, 1, "Should have one audit entry");
      assert.equal(trail[0].accessor, provider1, "Accessor should match");
    });

    it("should reject invalid action type", async () => {
      const patientId = "P001";
      const dataHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const invalidActionType = 99;
      
      try {
        await auditLogInstance.logAccess(patientId, dataHash, invalidActionType, "Test", { from: provider1 });
        assert.fail("Expected revert");
      } catch (error) {
        assert(error.message.includes("invalid action type"));
      }
    });
  });

  describe("Get Audit Trail", () => {
    it("should retrieve all entries for a patient", async () => {
      const patientId = "P001";
      const dataHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_VIEW(),
        "View 1",
        { from: provider1 }
      );
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_SHARE(),
        "Share 1",
        { from: provider2 }
      );
      
      const trail = await auditLogInstance.getAuditTrail(patientId);
      assert.equal(trail.length, 2, "Should have two entries");
    });

    it("should return empty array for patient with no logs", async () => {
      const patientId = "P999";
      const trail = await auditLogInstance.getAuditTrail(patientId);
      assert.equal(trail.length, 0, "Should have no entries");
    });
  });

  describe("Get Audit Trail By Time Range", () => {
    it("should filter entries by time range", async () => {
      const patientId = "P001";
      const dataHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      const startTime = Math.floor(Date.now() / 1000);
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_VIEW(),
        "Test",
        { from: provider1 }
      );
      
      const endTime = Math.floor(Date.now() / 1000) + 100;
      
      const filteredTrail = await auditLogInstance.getAuditTrailByTimeRange(
        patientId,
        startTime,
        endTime
      );
      
      assert.equal(filteredTrail.length, 1, "Should have one entry in range");
    });
  });

  describe("Get Audit Trail By Action Type", () => {
    it("should filter entries by action type", async () => {
      const patientId = "P001";
      const dataHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_VIEW(),
        "View",
        { from: provider1 }
      );
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_SHARE(),
        "Share",
        { from: provider2 }
      );
      
      const viewEntries = await auditLogInstance.getAuditTrailByActionType(
        patientId,
        await auditLogInstance.ACTION_VIEW()
      );
      
      assert.equal(viewEntries.length, 1, "Should have one VIEW entry");
      assert(viewEntries[0].actionDescription.includes("View"), "Should be VIEW action");
    });
  });

  describe("Get Audit Trail Count", () => {
    it("should return correct count of entries", async () => {
      const patientId = "P001";
      const dataHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_VIEW(),
        "Test",
        { from: provider1 }
      );
      
      await auditLogInstance.logAccess(
        patientId,
        dataHash,
        await auditLogInstance.ACTION_SHARE(),
        "Test",
        { from: provider2 }
      );
      
      const count = await auditLogInstance.getAuditTrailCount(patientId);
      assert.equal(count, 2, "Should have count of 2");
    });
  });
});

