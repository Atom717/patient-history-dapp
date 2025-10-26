# End-to-End Demo: Patient History Sharing

## Scenario Overview

**Provider A** (Dr. Smith's Clinic) wants to share a patient's FHIR bundle with **Provider B** (City General Hospital). The patient must first grant consent, then can review access and revoke if needed.

**Participants:**
- **Patient**: Alice (0xb7160E58e1b705829599912761507cD241c9d0f3)
- **Provider A**: Dr. Smith's Clinic (0x46cd2b423a9487709988030c7F21D98eD4342f4F)
- **Provider B**: City General Hospital (0x4854eD05efb63d740080518c66A0b1d1Aa1CF7B0)

---

## Step 1: Deploy Contracts (2 minutes)

### 1.1 Start Ganache
- Open Ganache GUI
- Click "Quickstart"
- Ensure port 7545

**Screenshot 1:** Ganache window with 10 accounts and 100 ETH each

### 1.2 Deploy Contracts
```bash
npm run migrate
```

**Expected Output:**
```
========================================
🚀 Deploying Patient History DApp Contracts
========================================

📝 Deploying PatientAccessControl...
✅ PatientAccessControl deployed at: 0x7B82726eDA44339EE925fE4c95F7336562e4364F

📋 Deploying ConsentManager...
✅ ConsentManager deployed at: 0x11179dA5312b404709C58d02216b438C8067608f

📊 Deploying AuditLog...
✅ AuditLog deployed at: 0xC6722d70Cb5e393B82Ccc6821054b53f12b584aE

💾 Deploying DataRegistry...
✅ DataRegistry deployed at: 0x68fA394773727f7105bFC742B4d263725e6e505B

👥 Setting up demo roles...
   Admin: 0x0B94A182719394403E3972882487eEC3b7aCA6ca (deployer)
   Patient: 0xb7160E58e1b705829599912761507cD241c9d0f3
   Provider 1: 0x46cd2b423a9487709988030c7F21D98eD4342f4F
   Provider 2: 0x4854eD05efb63d740080518c66A0b1d1Aa1CF7B0

========================================
✅ Deployment Complete!
========================================
```

**Screenshot 2:** Deployment output with all contract addresses

---

## Step 2: Run Complete Demo (1 minute)

### 2.1 Execute End-to-End Demo
```bash
npx truffle exec demo/end-to-end-demo.js
```

**Expected Output:**
```
🚀 Starting End-to-End Patient History Demo
==========================================

👥 Demo Participants:
Patient: 0xb7160E58e1b705829599912761507cD241c9d0f3
Provider A: 0x46cd2b423a9487709988030c7F21D98eD4342f4F
Provider B: 0x4854eD05efb63d740080518c66A0b1d1Aa1CF7B0

📋 Step 1: Provider A Creates FHIR Bundle
------------------------------------------
FHIR Bundle Hash: 98c2fe9c6f28a3b068979373c86f1f592d5a76966c3c9e5f45927bf48282c04c

💾 Step 2: Provider A Registers Data
------------------------------------
Storage Pointer: QmFHIR123456789abcdefghijklmnopqrstuvwxyz
✅ Data registered: 0xd821ccebe66273f5c8168ebdffe80d0292c3f54f6d3a13341ee88d3428c7aacc
✅ Access logged

🔐 Step 3: Patient Grants Consent
----------------------------------
Has consent before granting: false
✅ Consent granted: 0xa90ab4f590a8475f6c475da16c591655d157faf947b7e9902f9e6c95f08e9593
Has consent after granting: true

🔍 Step 4: Provider B Accesses Data
------------------------------------
Provider B has access: true
Number of data entries: 1
First entry hash: 98c2fe9c6f28a3b068979373c86f1f592d5a76966c3c9e5f45927bf48282c04c
Storage pointer: QmFHIR123456789abcdefghijklmnopqrstuvwxyz
Data integrity verified: [Transaction with DataVerified event]
✅ Access logged for Provider B

📊 Step 5: View Audit Trail
----------------------------
Total audit entries: 2

Entry 1:
  Accessor: 0x46cd2b423a9487709988030c7F21D98eD4342f4F
  Action: 1
  Timestamp: 2025-10-26T19:28:32.000Z
  Description: Provider A registered FHIR bundle

Entry 2:
  Accessor: 0x4854eD05efb63d740080518c66A0b1d1Aa1CF7B0
  Action: 2
  Timestamp: 2025-10-26T19:28:32.000Z
  Description: Provider B viewed patient FHIR bundle

👤 Step 6: Patient Reviews and Revokes
--------------------------------------
Consent Details:
  Provider: 0x4854eD05efb63d740080518c66A0b1d1Aa1CF7B0
  Permissions: 1
  Active: true
  Granted: 2025-10-26T19:28:32.000Z
✅ Consent revoked: 0x207db248d726f0b92a8675241d9f772b4731cec4661f2fc51b6ef9edc553d40c
Provider B has access after revoke: false

📊 Step 7: Final Audit Trail
-----------------------------
Total entries: 2

1. Provider A registered FHIR bundle
   Who: 0x46cd2b423a9487709988030c7F21D98eD4342f4F
   When: 27/10/2025, 12:58:32 am

2. Provider B viewed patient FHIR bundle
   Who: 0x4854eD05efb63d740080518c66A0b1d1Aa1CF7B0
   When: 27/10/2025, 12:58:32 am

🎉 Demo Complete!
==================
✅ FHIR Bundle created and registered
✅ Patient granted consent to Provider B
✅ Provider B accessed data with consent
✅ Data integrity verified
✅ Immutable audit trail created
✅ Patient revoked consent
✅ Provider B access denied after revocation
✅ Complete audit trail maintained
```

**Screenshot 3:** Complete demo output showing all steps

---

## Step 3: Manual Console Demo (Optional - 5 minutes)

### 3.1 Enter Truffle Console
```bash
truffle console
```

### 3.2 Load Contracts and Accounts
```javascript
const cm = await ConsentManager.deployed();
const dr = await DataRegistry.deployed();
const al = await AuditLog.deployed();
const accounts = await web3.eth.getAccounts();
const pt = accounts[1]; const pa = accounts[2]; const pb = accounts[3];
```

### 3.3 Test Individual Functions
```javascript
// Check consent
await cm.checkConsent(pt, pb, 1);

// Grant consent
await cm.grantConsent(pb, 1, 0, { from: pt });

// Verify consent
await cm.checkConsent(pt, pb, 1);

// Get data entries
await dr.getDataEntries("P001-Alice");

// Check audit trail
await al.getAuditTrail("P001-Alice");

// Revoke consent
await cm.revokeConsent(pb, { from: pt });

// Verify access denied
await cm.checkConsent(pt, pb, 1);
```

**Screenshot 4:** Console interactions showing individual function calls

---

## Summary of Screenshots (4 total)

1. ✅ Ganache with accounts
2. ✅ Contract deployment
3. ✅ Complete demo output
4. ✅ Console interactions (optional)

---

## Key Demonstrations

✅ **FHIR Bundle Creation**: Provider A creates compliant FHIR bundle  
✅ **Data Registration**: Hash stored on blockchain with IPFS pointer  
✅ **Consent Management**: Patient grants consent to Provider B  
✅ **Permission Verification**: Provider B checks consent before access  
✅ **Data Retrieval**: Provider B accesses FHIR data  
✅ **Integrity Verification**: Cryptographic hash verification  
✅ **Audit Trail**: Immutable logging of all access  
✅ **Patient Control**: Patient reviews and revokes consent  
✅ **Access Control**: Verify access denied after revocation  

---

## Testing Checklist

- [ ] Ganache running
- [ ] Contracts deployed
- [ ] Demo script executed successfully
- [ ] All 4 screenshots captured
- [ ] Console demo completed (optional)

---

**Total Demo Time: ~3 minutes**

## Quick Commands

```bash
# Start Ganache GUI
# Click "Quickstart"

# Deploy contracts
npm run migrate

# Run complete demo
npx truffle exec demo/end-to-end-demo.js

# Optional: Manual console demo
truffle console
```

---

## What This Demonstrates

This end-to-end demo showcases a complete **Patient History dApp** that:

1. **Enables secure data sharing** between healthcare providers
2. **Maintains patient control** over their medical data
3. **Provides immutable audit trails** for compliance
4. **Ensures data integrity** through cryptographic verification
5. **Implements granular consent management** with revocation capabilities

The system demonstrates how blockchain technology can be used to create a patient-centric healthcare data sharing platform that respects privacy while enabling necessary medical collaboration.
