// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PatientAccessControl.sol";
import "./ConsentManager.sol";

/**
 * @title DataRegistry
 * @dev Stores FHIR bundle hashes and metadata for integrity verification
 * @notice Manages off-chain storage pointers and data integrity
 */
contract DataRegistry {
    // Reference to PatientAccessControl
    PatientAccessControl public accessControl;
    
    // Data entry structure
    struct DataEntry {
        string fhirBundleHash;
        string storagePointer;  // IPFS CID or database UUID
        string patientId;
        address registeredBy;
        uint256 timestamp;
        bool active;
    }

    // Mapping: patientId => array of data entries
    mapping(string => DataEntry[]) public patientData;
    
    // Mapping: hash => exists (for duplicate prevention)
    mapping(string => bool) public hashExists;
    
    // Reference to ConsentManager
    ConsentManager public consentManager;

    // Events
    event DataRegistered(
        string indexed patientId,
        string fhirBundleHash,
        string storagePointer,
        address indexed registeredBy,
        uint256 timestamp
    );
    
    event DataVerified(
        string indexed patientId,
        string fhirBundleHash,
        bool verified
    );
    
    event DataDeactivated(
        string indexed patientId,
        string fhirBundleHash
    );

    /**
     * @dev Constructor
     * @param _consentManager Address of ConsentManager contract
     * @param _accessControl Address of AccessControl contract
     */
    constructor(address _consentManager, address _accessControl) {
        require(_consentManager != address(0), "DataRegistry: invalid consent manager address");
        require(_accessControl != address(0), "DataRegistry: invalid access control address");
        consentManager = ConsentManager(_consentManager);
        accessControl = PatientAccessControl(_accessControl);
    }

    /**
     * @dev Modifier to restrict access to providers only
     */
    modifier onlyProvider() {
        require(accessControl.hasRole(msg.sender, accessControl.PROVIDER_ROLE()), 
            "DataRegistry: caller must be a provider");
        _;
    }

    /**
     * @dev Modifier to restrict access to admins only
     */
    modifier onlyAdmin() {
        require(accessControl.hasRole(msg.sender, accessControl.ADMIN_ROLE()), 
            "DataRegistry: caller must be an admin");
        _;
    }

    /**
     * @dev Register a new data entry
     * @param _fhirBundleHash SHA-256 hash of FHIR bundle
     * @param _storagePointer Off-chain storage location (IPFS CID or DB UUID)
     * @param _patientId Patient identifier
     */
    function registerData(
        string memory _fhirBundleHash,
        string memory _storagePointer,
        string memory _patientId
    ) 
        external 
        onlyProvider 
    {
        require(bytes(_fhirBundleHash).length == 64, "DataRegistry: invalid hash format (must be 64 chars)");
        require(bytes(_storagePointer).length > 0, "DataRegistry: storage pointer cannot be empty");
        require(bytes(_patientId).length > 0, "DataRegistry: patient ID cannot be empty");
        require(!hashExists[_fhirBundleHash], "DataRegistry: hash already exists");
        
        // Create new data entry
        DataEntry memory newEntry = DataEntry({
            fhirBundleHash: _fhirBundleHash,
            storagePointer: _storagePointer,
            patientId: _patientId,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            active: true
        });
        
        // Add to patient's data array
        patientData[_patientId].push(newEntry);
        
        // Mark hash as exists
        hashExists[_fhirBundleHash] = true;
        
        emit DataRegistered(
            _patientId,
            _fhirBundleHash,
            _storagePointer,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Verify integrity of data by checking hash
     * @param _patientId Patient identifier
     * @param _fhirBundleHash Hash to verify
     * @return bool True if hash exists for patient
     */
    function verifyIntegrity(
        string memory _patientId,
        string memory _fhirBundleHash
    ) 
        external 
        returns (bool) 
    {
        DataEntry[] memory entries = patientData[_patientId];
        
        for (uint256 i = 0; i < entries.length; i++) {
            if (
                keccak256(bytes(entries[i].fhirBundleHash)) == 
                keccak256(bytes(_fhirBundleHash)) &&
                entries[i].active
            ) {
                emit DataVerified(_patientId, _fhirBundleHash, true);
                return true;
            }
        }
        
        emit DataVerified(_patientId, _fhirBundleHash, false);
        return false;
    }

    /**
     * @dev Get all data entries for a patient
     * @param _patientId Patient identifier
     * @return DataEntry[] Array of data entries
     */
    function getDataEntries(string memory _patientId) 
        external 
        view 
        returns (DataEntry[] memory) 
    {
        return patientData[_patientId];
    }

    /**
     * @dev Get specific data entry by index
     * @param _patientId Patient identifier
     * @param _index Index in the array
     * @return DataEntry Data entry struct
     */
    function getDataEntry(string memory _patientId, uint256 _index) 
        external 
        view 
        returns (DataEntry memory) 
    {
        require(_index < patientData[_patientId].length, "DataRegistry: index out of bounds");
        return patientData[_patientId][_index];
    }

    /**
     * @dev Get count of data entries for a patient
     * @param _patientId Patient identifier
     * @return uint256 Count of entries
     */
    function getDataEntryCount(string memory _patientId) 
        external 
        view 
        returns (uint256) 
    {
        return patientData[_patientId].length;
    }

    /**
     * @dev Deactivate a data entry (only by provider who registered it or admin)
     * @param _patientId Patient identifier
     * @param _index Index of the entry to deactivate
     */
    function deactivateDataEntry(string memory _patientId, uint256 _index) 
        external 
    {
        require(_index < patientData[_patientId].length, "DataRegistry: index out of bounds");
        
        DataEntry storage entry = patientData[_patientId][_index];
        
        // Check permissions: admin or original provider
        require(
            accessControl.hasRole(msg.sender, accessControl.ADMIN_ROLE()) || 
            entry.registeredBy == msg.sender,
            "DataRegistry: unauthorized"
        );
        
        require(entry.active, "DataRegistry: entry already deactivated");
        
        entry.active = false;
        
        emit DataDeactivated(_patientId, entry.fhirBundleHash);
    }
}

