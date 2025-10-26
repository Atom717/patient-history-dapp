# Setup Guide

## Prerequisites

### 1. Install Node.js and npm
- Download and install Node.js v16 or higher from [nodejs.org](https://nodejs.org/)
- Verify installation:
```bash
node --version
npm --version
```

### 2. Install Truffle Suite
```bash
npm install -g truffle
truffle version
```

### 3. Install Ganache
- **GUI Version**: Download from [trufflesuite.com/ganache](https://trufflesuite.com/ganache/)
- **CLI Version**: 
```bash
npm install -g ganache-cli
```

### 4. VS Code Extensions (Recommended)
- Solidity (by Juan Blanco)
- ESLint
- Prettier

## Installation Steps

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd patient-history-dapp
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Ganache
**GUI Version:**
1. Open Ganache
2. Create new workspace
3. Set host: 127.0.0.1
4. Set port: 7545
5. Click "Start"

**CLI Version:**
```bash
ganache-cli -p 7545 -h 127.0.0.1
```

### 4. Compile Smart Contracts
```bash
npm run compile
```

### 5. Deploy Contracts
```bash
npm run migrate
```

This will deploy all contracts to Ganache and assign demo roles to accounts.

### 6. Run Tests
```bash
npm run test
```

### 7. Start Backend Server
```bash
npm run start:backend
```

The API will be available at `http://localhost:3000`

## Verification

### Check Deployment
After migration, you should see console output with contract addresses:
```
AccessControl deployed at: 0x...
ConsentManager deployed at: 0x...
DataRegistry deployed at: 0x...
AuditLog deployed at: 0x...
```

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Patient History DApp API"
}
```

## Network Configuration

### Ganache Network
- Host: 127.0.0.1
- Port: 7545
- Network ID: 5777
- Chain ID: 5777

### MetaMask Setup
1. Add Custom Network:
   - Network Name: Ganache Local
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 5777
   - Currency Symbol: ETH

2. Import Accounts:
   - Use Ganache UI to view private keys
   - Import accounts to MetaMask

## Troubleshooting

### Port Already in Use
If port 7545 is in use:
- Change Ganache port
- Update `truffle-config.js` network port
- Update `.env` file

### Contract Not Deployed
```bash
truffle migrate --reset
```

### Tests Failing
```bash
# Clear build artifacts
rm -rf build/

# Recompile
npm run compile

# Run tests
npm run test
```

## Next Steps

1. Review the smart contracts in `contracts/`
2. Explore test files in `test/`
3. Check API endpoints in `backend/routes/`
4. Begin Phase 3: FHIR Integration

