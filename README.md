# Patient History dApp

A blockchain-based patient history sharing system that enables secure, consent-driven sharing of FHIR bundles between healthcare providers while maintaining patient privacy and providing immutable audit trails.

## 🏥 Overview

This dApp implements a patient-centric healthcare data sharing platform using Ethereum smart contracts. It allows healthcare providers to securely share patient FHIR bundles while ensuring:

- **Patient Control**: Patients can grant, review, and revoke consent
- **Data Privacy**: All PHI remains off-chain, only hashes and metadata on-chain
- **Audit Trails**: Immutable logging of all data access events
- **Integrity Verification**: Cryptographic verification of data integrity

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Ganache GUI or CLI
- Truffle Framework

### Installation
```bash
git clone [<your-repo-url>](https://github.com/Atom717/patient-history-dapp)
cd patient-history-dapp
npm install
```

### Run Demo
```bash
# Start Ganache GUI (Quickstart)
# Deploy contracts
npm run migrate

# Run complete end-to-end demo
npx truffle exec demo/end-to-end-demo.js
```

## 📋 Features

### ✅ End-to-End Demo
Complete scenario demonstrating:
- Provider A shares FHIR bundle
- Provider B verifies integrity and permissions  
- Patient reviews and revokes access
- Immutable audit trail maintained

### ✅ PHI Privacy Compliance
- **ON-CHAIN**: Only hashes, pointers, and generic metadata
- **OFF-CHAIN**: All sensitive patient data (names, DOB, medical records)
- No PHI exposure in smart contracts

### ✅ Comprehensive Testing
- 16 passing tests covering access control and audit verification
- Consent management testing
- Data integrity verification
- Role-based access control

## 🏗️ Architecture

### Smart Contracts
- **PatientAccessControl**: Role-based access control (Patient, Provider, Admin)
- **ConsentManager**: Patient consent granting, revocation, and management
- **DataRegistry**: FHIR bundle hash storage and integrity verification
- **AuditLog**: Immutable audit trail for all data access events

### Data Flow
1. Provider creates FHIR bundle (off-chain)
2. Provider registers bundle hash on blockchain
3. Patient grants consent to other providers
4. Providers verify consent before accessing data
5. All access events logged immutably

## 📁 Project Structure

```
├── contracts/           # Smart contracts
│   ├── PatientAccessControl.sol
│   ├── ConsentManager.sol
│   ├── DataRegistry.sol
│   └── AuditLog.sol
├── migrations/         # Deployment scripts
├── test/              # Test suites
├── demo/              # Demo scripts and documentation
├── backend/           # Backend API (Node.js/Express)
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## 🔧 Commands

```bash
# Compile contracts
npm run compile

# Deploy contracts
npm run migrate

# Run tests
npm run test

# Run end-to-end demo
npx truffle exec demo/end-to-end-demo.js

# Enter Truffle console
truffle console
```

## 🧪 Testing

The project includes comprehensive test coverage:

- **Access Control Tests**: Role assignment, revocation, modifiers
- **Audit Log Tests**: Event logging, trail retrieval, filtering
- **Consent Tests**: Granting, revoking, permission management
- **Data Registry Tests**: Registration, integrity verification

Run tests with:
```bash
npm run test
```

## 📊 Demo Output

The end-to-end demo shows:
```
🚀 Starting End-to-End Patient History Demo
👥 Demo Participants: Patient, Provider A, Provider B
📋 Step 1: Provider A Creates FHIR Bundle
💾 Step 2: Provider A Registers Data
🔐 Step 3: Patient Grants Consent
🔍 Step 4: Provider B Accesses Data
📊 Step 5: View Audit Trail
👤 Step 6: Patient Reviews and Revokes
📊 Step 7: Final Audit Trail
🎉 Demo Complete!
```

## 🔒 Security Features

- **Role-based Access Control**: Patient, Provider, Admin roles
- **Consent Management**: Granular permissions with revocation
- **Data Integrity**: SHA-256 hash verification
- **Audit Trails**: Immutable logging for compliance
- **PHI Protection**: All sensitive data remains off-chain

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Run Guide](docs/RUN_GUIDE.md)
- [End-to-End Demo](demo/end-to-end-demo.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏥 Use Cases

- **Healthcare Provider Networks**: Secure data sharing between hospitals
- **Telemedicine**: Patient data access for remote consultations
- **Clinical Trials**: Consent-driven data sharing for research
- **Emergency Care**: Rapid access to patient history with proper consent

## 🔮 Future Enhancements

- Frontend web interface
- Mobile app integration
- Advanced consent granularity
- Integration with existing EHR systems
- Multi-chain support

---

**Built with ❤️ for healthcare innovation**
