# Complete Run Guide

This guide will walk you through running the Patient History DApp from start to finish.

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v16+) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- Ganache (GUI) - [Download](https://trufflesuite.com/ganache/)
- Git

## Step 1: Clone and Install

```bash
# Navigate to the project directory
cd patient-history-dapp

# Install all dependencies
npm install

# Verify Truffle is installed globally
npm install -g truffle
truffle version
```

**Expected Output:**
```
Truffle v5.11.5 (core: 5.11.5)
Solidity v0.8.19 (solc-js)
```

## Step 2: Start Ganache

### Option A: Ganache GUI (Recommended for Beginners)
1. Open Ganache application
2. Click "Quickstart" or create a new workspace
3. Keep default settings (Port: 7545, Host: 127.0.0.1)
4. Click "Start"
5. You should see 10 accounts with 100 ETH each

### Option B: Ganache CLI
```bash
npx ganache-cli -p 7545 -h 127.0.0.1
```

**Expected Output:**
```
Ganache CLI v6.12.2 (ganache-core: 2.13.2)

(0) 0x...
(1) 0x...
...
(9) 0x...

Available Accounts
==================
(0) 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
(1) 0xf17f52151EbEF6C7334FAD080c5704D77216b732
...
```

## Step 3: Compile Smart Contracts

```bash
npm run compile
```

**Expected Output:**
```
Compiling your contracts...
===========================

> Compiling ./contracts/AccessControl.sol
> Compiling ./contracts/ConsentManager.sol
> Compiling ./contracts/DataRegistry.sol
> Compiling ./contracts/AuditLog.sol
> Compiling ./contracts/Migrations.sol

Compiling ./contracts/AccessControl.sol
Compiling ./contracts/ConsentManager.sol
...
Artifacts written to D:\...\build\contracts
Compiled successfully using:
   - solc: 0.8.19+commit.7dd6d404.Emscripten.clang
```

You should see:
- ✅ All contracts compiled successfully
- `build/contracts/` directory created with JSON artifacts

## Step 4: Deploy Contracts to Ganache

```bash
npm run migrate
```

**Expected Output:**
```
========================================
🚀 Deploying Patient History DApp Contracts
========================================

📝 Deploying AccessControl...
✅ AccessControl deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c946faA

📋 Deploying ConsentManager...
✅ ConsentManager deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

📊 Deploying AuditLog...
✅ AuditLog deployed at: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

💾 Deploying DataRegistry...
✅ DataRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

👥 Setting up demo roles...
   Admin: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 (deployer)
   Patient: 0xf17f52151EbEF6C7334FAD080c5704D77216b732
   Provider 1: 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef
   Provider 2: 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544

========================================
✅ Deployment Complete!
========================================
```

**Important**: Save these contract addresses for testing!

## Step 5: Run Tests

```bash
npm run test
```

**Expected Output:**
```
Using network 'development'.

  Contract: AccessControl
    ✓ should assign PATIENT_ROLE to an address (XXXms)
    ✓ should assign PROVIDER_ROLE to an address (XXXms)
    ✓ should revoke a role (XXXms)
    ...
  Contract: ConsentManager
    ✓ should allow patient to grant consent with READ permission (XXXms)
    ✓ should allow patient to grant multiple permissions (XXXms)
    ...
  Contract: DataRegistry
    ✓ should allow provider to register data (XXXms)
    ✓ should prevent duplicate hash registration (XXXms)
    ...
  Contract: AuditLog
    ✓ should log an access event (XXXms)
    ✓ should retrieve all entries for a patient (XXXms)
    ...

  12 passing (XXs)
```

**Verification:**
- All tests should pass ✅
- No errors or warnings
- Total execution time displayed

## Step 6: Start the Backend API

Open a new terminal and run:

```bash
npm run start:backend
```

**Expected Output:**
```
🚀 Server running on port 3000
📡 API available at http://localhost:3000
🏥 Health check at http://localhost:3000/health
```

The server is now running! Keep this terminal open.

## Step 7: Test the API

### 7.1 Test Health Endpoint

Open another terminal:

```bash
curl http://localhost:3000/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Patient History DApp API"
}
```

### 7.2 Test Patient Registration

```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "address": "0xf17f52151EbEF6C7334FAD080c5704D77216b732"
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "patientId": "P001",
  "address": "0xf17f52151EbEF6C7334FAD080c5704D77216b732"
}
```

### 7.3 Test Consent Granting

```bash
curl -X POST http://localhost:3000/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "patientAddress": "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    "providerAddress": "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
    "permissions": 1,
    "expiry": 0
  }'
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Consent granted successfully",
  "patientAddress": "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
  "providerAddress": "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
  "permissions": 1,
  "expiry": 0
}
```

### 7.4 Test FHIR Data Upload

```bash
curl -X POST http://localhost:3000/api/data/upload \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "P001",
    "fhirBundle": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": []
    },
    "storagePointer": "QmHash..."
  }'
```

## Step 8: Interactive Testing with Truffle Console

```bash
truffle console
```

This opens an interactive console. Try:

```javascript
// Get deployed contracts
const AccessControl = await AccessControl.deployed();
const ConsentManager = await ConsentManager.deployed();

// Get accounts
const accounts = await web3.eth.getAccounts();

// Check roles
const adminRole = await AccessControl.ADMIN_ROLE();
const patientRole = await AccessControl.PATIENT_ROLE();
const providerRole = await AccessControl.PROVIDER_ROLE();

// View account roles
console.log('Admin:', accounts[0]);
console.log('Patient:', accounts[1]);
console.log('Provider:', accounts[2]);

// Check if account[1] is a patient
const hasRole = await AccessControl.hasRole(accounts[1], patientRole);
console.log('Is patient:', hasRole);

// Grant consent
await ConsentManager.grantConsent(
  accounts[2],  // Provider
  1,           // READ permission
  0,           // No expiry
  { from: accounts[1] } // From patient
);

// Exit console
.exit
```

## Step 9: View Transactions in Ganache

1. Open Ganache UI
2. Click on "Transactions" tab
3. You'll see all transactions from deployment, tests, and API calls
4. Click on any transaction to see details:
   - Gas used
   - From/To addresses
   - Transaction hash
   - Status

## Step 10: View Event Logs

After running tests, check the event logs in Ganache:
1. Look at the "Logs" in transactions
2. You'll see events like:
   - `ConsentGranted`
   - `DataRegistered`
   - `AccessLogged`

## Troubleshooting

### Port 7545 Already in Use
```bash
# Find process using port
netstat -ano | findstr :7545

# Kill process or change Ganache port
```

### Contracts Not Compiling
```bash
# Clear build artifacts
rm -rf build/
rm -rf .openzeppelin/

# Reinstall node_modules
rm -rf node_modules/
npm install

# Recompile
npm run compile
```

### Tests Failing
```bash
# Reset migrations
npm run migrate:reset

# Check Ganache is running
# Check network in truffle-config.js
```

### API Not Responding
```bash
# Check backend server is running
# Check port 3000 is not in use
# Check CORS settings in backend/server.js
```

## Success Checklist

✅ Node.js and npm installed  
✅ Ganache running on port 7545  
✅ Contracts compiled successfully  
✅ Contracts deployed to Ganache  
✅ All tests passing (12 tests)  
✅ Backend API running on port 3000  
✅ Health endpoint responding  
✅ API endpoints functional  

## Next Steps

1. **Phase 3**: Implement FHIR bundle handling and encryption
2. **Phase 6**: Build React frontend with MetaMask
3. **Phase 7**: End-to-end testing with real scenarios
4. **Phase 8**: Create demo and presentation

## Additional Resources

- **Truffle Docs**: https://trufflesuite.com/docs/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Web3.js**: https://web3js.readthedocs.io/
- **FHIR**: https://www.hl7.org/fhir/

## Support

If you encounter issues:
1. Check Ganache is running
2. Verify network configuration
3. Review contract addresses are correct
4. Check gas limits aren't exceeded
5. Look at Ganache transaction logs for errors

Happy coding! 🚀

