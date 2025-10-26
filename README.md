# Patient History DApp

A blockchain-based patient history management system with HL7 FHIR integration, ensuring secure, auditable, and consent-based healthcare data sharing.

## Project Overview

This decentralized application (DApp) leverages Ethereum smart contracts to manage patient medical histories with the following key features:

- **Role-based Access Control**: Patient, Provider, and Admin roles
- **Consent Management**: Granular permissions and time-bound access tokens
- **FHIR Integration**: HL7 FHIR R4 compliant data handling
- **Immutable Audit Logs**: Blockchain-based access tracking
- **Data Integrity**: On-chain hash verification for off-chain storage

## Technology Stack

- **Smart Contracts**: Solidity 0.8.19
- **Framework**: Truffle Suite
- **Local Blockchain**: Ganache
- **Access Control**: OpenZeppelin Contracts v5.0
- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Web3**: Web3.js / ethers.js
- **Storage**: IPFS or PostgreSQL

## Project Structure

```
patient-history-dapp/
├── contracts/           # Solidity smart contracts
│   ├── AccessControl.sol
│   ├── ConsentManager.sol
│   ├── DataRegistry.sol
│   └── AuditLog.sol
├── migrations/          # Truffle migrations
├── test/               # Test suites
├── backend/            # Node.js API server
├── frontend/           # React frontend
└── docs/               # Documentation

```

## Quick Start

### Prerequisites

- Node.js v16+
- npm
- Truffle Suite
- Ganache (GUI or CLI)
- MetaMask extension

### Installation

```bash
# Install dependencies
npm install

# Install Truffle globally (if not already installed)
npm install -g truffle

# Compile contracts
npm run compile

# Run tests
npm run test
```

### Development Workflow

1. Start Ganache local blockchain
2. Deploy contracts: `truffle migrate --reset`
3. Run tests: `truffle test`
4. Start backend: `npm run start:backend`
5. Start frontend: `npm run dev:frontend`

## Smart Contracts

### AccessControl.sol
Role-based access control using OpenZeppelin's AccessControl contract.

**Roles:**
- `PATIENT_ROLE`: 0x0000000000000000000000000000000000000000000000000000000000000001
- `PROVIDER_ROLE`: 0x0000000000000000000000000000000000000000000000000000000000000002
- `ADMIN_ROLE`: 0x0000000000000000000000000000000000000000000000000000000000000003

### ConsentManager.sol
Manages patient consent for data sharing with granular permissions.

**Key Functions:**
- `grantConsent(address provider, uint8 permissions, uint256 expiry)`
- `revokeConsent(address provider)`
- `checkConsent(address patient, address provider, uint8 permission)`

### DataRegistry.sol
Stores FHIR bundle hashes and metadata for integrity verification.

**Key Functions:**
- `registerData(string memory fhirBundleHash, string memory storagePointer, string memory patientId, uint256 timestamp)`
- `verifyIntegrity(string memory fhirBundleHash)`
- `getDataEntries(string memory patientId)`

### AuditLog.sol
Immutable logging of all data access events.

**Key Functions:**
- `logAccess(address accessor, string memory patientId, uint256 timestamp, uint8 actionType)`
- `getAuditTrail(string memory patientId)`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Patients
- `POST /api/patients` - Register patient
- `GET /api/patients/:patientId` - Get patient info

### Consent
- `POST /api/consent` - Grant consent
- `DELETE /api/consent/:consentId` - Revoke consent
- `GET /api/consent/:patientId` - List consents

### Data
- `POST /api/data/upload` - Upload FHIR bundle
- `GET /api/data/:patientId` - Retrieve bundles
- `GET /api/data/verify/:hash` - Verify integrity

### Audit
- `GET /api/audit/:patientId` - Get audit logs

## Development Phases

- [x] Phase 1: Environment Setup & Prerequisites (Week 1)
- [x] Phase 2: Smart Contract Architecture (Week 2)
- [ ] Phase 3: FHIR Integration Layer (Week 3)
- [ ] Phase 4: Backend API Gateway (Week 4)
- [ ] Phase 5: Smart Contract Testing (Week 5)
- [ ] Phase 6: Frontend Development (Week 6-7)
- [ ] Phase 7: Integration & End-to-End Testing (Week 8)
- [ ] Phase 8: Documentation & Demo Preparation (Week 9-10)

## Testing

Run all tests:
```bash
npm run test
```

Run coverage:
```bash
npm run coverage
```

## License

MIT

## Contributors

Add your name here

