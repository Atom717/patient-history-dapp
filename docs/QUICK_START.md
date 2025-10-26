# Quick Start Guide

## Prerequisites
- Node.js v16+
- npm
- Ganache (GUI or CLI)

## Installation

```bash
# Install dependencies
npm install

# Install Truffle globally (if not already installed)
npm install -g truffle
```

## Start Development

### 1. Start Ganache
**GUI**: Open Ganache, create workspace on port 7545
**CLI**: `ganache-cli -p 7545 -h 127.0.0.1`

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Deploy Contracts
```bash
npm run migrate
```

You should see:
```
AccessControl deployed at: 0x...
ConsentManager deployed at: 0x...
DataRegistry deployed at: 0x...
AuditLog deployed at: 0x...
```

### 4. Run Tests
```bash
npm run test
```

### 5. Start Backend
```bash
npm run start:backend
```

API available at: `http://localhost:3000`

## Project Structure

```
patient-history-dapp/
├── contracts/              # Solidity smart contracts
│   ├── AccessControl.sol
│   ├── ConsentManager.sol
│   ├── DataRegistry.sol
│   └── AuditLog.sol
├── migrations/             # Truffle deployments
├── test/                   # Test suites
├── backend/                # Node.js API server
│   ├── routes/             # API endpoints
│   ├── config/             # Web3 configuration
│   └── utils/              # Helper functions
├── docs/                   # Documentation
└── package.json
```

## Smart Contracts

### AccessControl
Manages roles: Patient, Provider, Admin

### ConsentManager
Handles consent granting and revocation

### DataRegistry
Stores FHIR bundle hashes for integrity

### AuditLog
Immutable access logging

## Next Steps

1. Complete Phase 3: FHIR Integration
2. Implement full backend Web3 integration
3. Build React frontend
4. End-to-end testing

## Help

See `docs/SETUP.md` for detailed setup instructions
See `docs/ARCHITECTURE.md` for system architecture

