# System Architecture

## Overview

The Patient History DApp is a blockchain-based healthcare data management system that leverages Ethereum smart contracts for access control, consent management, and audit logging, while integrating with HL7 FHIR standard for healthcare data representation.

## System Components

### 1. Smart Contracts Layer

#### AccessControl.sol
**Purpose**: Role-based access control (RBAC)  
**Roles**:
- `PATIENT_ROLE`: Patients who own their medical data
- `PROVIDER_ROLE`: Healthcare providers authorized to access patient data
- `ADMIN_ROLE`: System administrators

**Key Features**:
- Role assignment and revocation
- Emergency pause functionality
- Role verification

#### ConsentManager.sol
**Purpose**: Manage patient consent for data sharing  
**Permissions**:
- `PERMISSION_READ`: Read patient data
- `PERMISSION_WRITE`: Write/modify patient data
- `PERMISSION_SHARE`: Share patient data

**Key Features**:
- Granular consent granting
- Time-bound access tokens
- Consent revocation
- Permission updates

#### DataRegistry.sol
**Purpose**: Store FHIR bundle hashes and metadata  
**Storage Strategy**:
- On-chain: Hash of FHIR bundle (SHA-256)
- Off-chain: IPFS CID or database UUID

**Key Features**:
- Hash-based integrity verification
- Duplicate prevention
- Data deactivation

#### AuditLog.sol
**Purpose**: Immutable access logging  
**Action Types**:
- `ACTION_REGISTER`: Data registration
- `ACTION_VIEW`: Data viewing
- `ACTION_MODIFY`: Data modification
- `ACTION_SHARE`: Data sharing
- `ACTION_DELETE`: Data deletion
- `ACTION_CONSENT_GRANT`: Consent granted
- `ACTION_CONSENT_REVOKE`: Consent revoked

**Key Features**:
- Immutable audit trails
- Time-based filtering
- Action type filtering

## Data Flow

### Patient Registration
```
1. User registers as patient → AccessControl.assignRole(PATIENT_ROLE)
2. Patient address stored in blockchain
3. Patient gains access to patient dashboard
```

### Provider Registration
```
1. Healthcare provider registers → AccessControl.assignRole(PROVIDER_ROLE)
2. Provider can request patient data access
```

### Data Upload Flow
```
1. Provider creates FHIR bundle
2. Bundle encrypted (AES-256-GCM)
3. Generate SHA-256 hash
4. Upload encrypted bundle to IPFS/DB
5. Store hash on-chain via DataRegistry.registerData()
6. Log access via AuditLog.logAccess(ACTION_REGISTER)
```

### Data Access Flow
```
1. Provider requests patient data
2. Check ConsentManager.checkConsent()
3. If authorized:
   - Retrieve storage pointer from DataRegistry
   - Fetch encrypted bundle from IPFS/DB
   - Decrypt and return to provider
   - Log access via AuditLog.logAccess(ACTION_VIEW)
4. If not authorized:
   - Reject request
   - Log unauthorized access attempt
```

### Consent Granting Flow
```
1. Patient grants consent to provider
2. ConsentManager.grantConsent() called
3. Event emitted on blockchain
4. Provider can now access data (if within expiry)
5. AuditLog.logAccess(ACTION_CONSENT_GRANT)
```

### Consent Revocation Flow
```
1. Patient revokes consent
2. ConsentManager.revokeConsent() called
3. Event emitted on blockchain
4. Provider's access immediately terminated
5. AuditLog.logAccess(ACTION_CONSENT_REVOKE)
```

## Integration Layers

### Backend API Layer
**Framework**: Node.js + Express  
**Responsibilities**:
- REST API endpoints
- Web3 contract interaction
- JWT authentication
- Request validation
- Error handling

**Endpoints**:
- `POST /api/patients` - Register patient
- `POST /api/consent` - Grant consent
- `DELETE /api/consent/:consentId` - Revoke consent
- `POST /api/data/upload` - Upload FHIR bundle
- `GET /api/data/:patientId` - Retrieve data
- `GET /api/audit/:patientId` - Get audit logs

### FHIR Integration Layer
**Standard**: HL7 FHIR R4  
**Resource Types**:
- Patient: Demographics
- Encounter: Visit information
- Observation: Lab results, vital signs
- Condition: Diagnoses
- Procedure: Medical procedures

**Storage Options**:
1. **IPFS** (Decentralized)
   - Pros: Distributed, immutable
   - Cons: Slower retrieval
2. **PostgreSQL** (Centralized)
   - Pros: Fast, reliable
   - Cons: Single point of failure

### Frontend Layer
**Framework**: React + Vite  
**Key Pages**:
- Patient Dashboard
- Provider Portal
- Admin Panel

**Web3 Integration**:
- MetaMask wallet connection
- Transaction signing
- Network detection

## Security Architecture

### Access Control
- Role-based permissions
- Smart contract enforced
- Immutable on blockchain

### Data Encryption
- AES-256-GCM encryption
- Patient-derived keys
- Encryption at rest

### Audit Trail
- All access logged on-chain
- Immutable and tamper-proof
- Compliance ready

### Consent Management
- Granular permissions
- Time-bound access
- Revocation capability

## Deployment Architecture

### Development Environment
- Ganache (local blockchain)
- Local network (127.0.0.1:7545)
- Test accounts with preloaded ETH

### Production Environment
- Ethereum mainnet or L2 (Polygon, Arbitrum)
- Infura/Alchemy for node access
- MetaMask for user transactions

## Gas Optimization

### Strategies
1. Batch operations where possible
2. Use events for data retrieval
3. Optimize storage patterns
4. Remove redundant code

### Estimated Costs
- Deploy contracts: ~2M gas
- Grant consent: ~50K gas
- Register data: ~100K gas
- Log access: ~30K gas

## Scalability Considerations

### Current Limitations
- Ethereum gas costs
- Transaction confirmation times
- On-chain storage costs

### Solutions
1. L2 solutions (Polygon, Arbitrum)
2. IPFS for large data
3. Batch transactions
4. Off-chain computation

## Testing Strategy

### Unit Tests
- Smart contract functions
- Access control
- Consent management
- Data integrity

### Integration Tests
- End-to-end flows
- API + smart contracts
- Web3 interactions

### Coverage Goal
- >90% code coverage
- All critical paths tested

