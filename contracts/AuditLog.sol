// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PatientAccessControl.sol";
import "./ConsentManager.sol";

/**
 * @title AuditLog
 * @dev Immutable logging of all data access events
 * @notice Provides audit trail for compliance and transparency
 */
contract AuditLog {
    // Reference to PatientAccessControl
    PatientAccessControl public accessControl;
    
    // Action types
    uint8 public constant ACTION_REGISTER = 1;
    uint8 public constant ACTION_VIEW = 2;
    uint8 public constant ACTION_MODIFY = 3;
    uint8 public constant ACTION_SHARE = 4;
    uint8 public constant ACTION_DELETE = 5;
    uint8 public constant ACTION_CONSENT_GRANT = 6;
    uint8 public constant ACTION_CONSENT_REVOKE = 7;

    // Audit entry structure
    struct AuditEntry {
        address accessor;
        string patientId;
        string dataHash;
        uint256 timestamp;
        uint8 actionType;
        string actionDescription;
    }

    // Mapping: patientId => array of audit entries
    mapping(string => AuditEntry[]) public auditTrails;
    
    // Total audit entries counter
    uint256 public totalEntries;
    
    // Reference to ConsentManager
    ConsentManager public consentManager;

    // Events
    event AccessLogged(
        address indexed accessor,
        string indexed patientId,
        string dataHash,
        uint256 timestamp,
        uint8 actionType,
        string actionDescription
    );

    /**
     * @dev Constructor
     * @param _consentManager Address of ConsentManager contract
     * @param _accessControl Address of AccessControl contract
     */
    constructor(address _consentManager, address _accessControl) {
        require(_consentManager != address(0), "AuditLog: invalid consent manager address");
        require(_accessControl != address(0), "AuditLog: invalid access control address");
        consentManager = ConsentManager(_consentManager);
        accessControl = PatientAccessControl(_accessControl);
    }

    /**
     * @dev Log an access event
     * @param _patientId Patient identifier
     * @param _dataHash Hash of the accessed data
     * @param _actionType Type of action performed
     * @param _actionDescription Human-readable description
     */
    function logAccess(
        string memory _patientId,
        string memory _dataHash,
        uint8 _actionType,
        string memory _actionDescription
    ) 
        external 
    {
        require(bytes(_patientId).length > 0, "AuditLog: patient ID cannot be empty");
        require(_actionType > 0 && _actionType <= 7, "AuditLog: invalid action type");
        
        AuditEntry memory newEntry = AuditEntry({
            accessor: msg.sender,
            patientId: _patientId,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            actionType: _actionType,
            actionDescription: _actionDescription
        });
        
        auditTrails[_patientId].push(newEntry);
        totalEntries++;
        
        emit AccessLogged(
            msg.sender,
            _patientId,
            _dataHash,
            block.timestamp,
            _actionType,
            _actionDescription
        );
    }

    /**
     * @dev Get audit trail for a specific patient
     * @param _patientId Patient identifier
     * @return AuditEntry[] Array of audit entries
     */
    function getAuditTrail(string memory _patientId) 
        external 
        view 
        returns (AuditEntry[] memory) 
    {
        return auditTrails[_patientId];
    }

    /**
     * @dev Get audit entries within a time range
     * @param _patientId Patient identifier
     * @param _startTime Start timestamp
     * @param _endTime End timestamp
     * @return AuditEntry[] Filtered audit entries
     */
    function getAuditTrailByTimeRange(
        string memory _patientId,
        uint256 _startTime,
        uint256 _endTime
    ) 
        external 
        view 
        returns (AuditEntry[] memory) 
    {
        require(_endTime >= _startTime, "AuditLog: invalid time range");
        
        AuditEntry[] memory allEntries = auditTrails[_patientId];
        
        // Count matching entries
        uint256 count = 0;
        for (uint256 i = 0; i < allEntries.length; i++) {
            if (allEntries[i].timestamp >= _startTime && allEntries[i].timestamp <= _endTime) {
                count++;
            }
        }
        
        // Create filtered array
        AuditEntry[] memory filteredEntries = new AuditEntry[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allEntries.length; i++) {
            if (allEntries[i].timestamp >= _startTime && allEntries[i].timestamp <= _endTime) {
                filteredEntries[index] = allEntries[i];
                index++;
            }
        }
        
        return filteredEntries;
    }

    /**
     * @dev Get audit entries filtered by action type
     * @param _patientId Patient identifier
     * @param _actionType Action type to filter by
     * @return AuditEntry[] Filtered audit entries
     */
    function getAuditTrailByActionType(
        string memory _patientId,
        uint8 _actionType
    ) 
        external 
        view 
        returns (AuditEntry[] memory) 
    {
        AuditEntry[] memory allEntries = auditTrails[_patientId];
        
        // Count matching entries
        uint256 count = 0;
        for (uint256 i = 0; i < allEntries.length; i++) {
            if (allEntries[i].actionType == _actionType) {
                count++;
            }
        }
        
        // Create filtered array
        AuditEntry[] memory filteredEntries = new AuditEntry[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allEntries.length; i++) {
            if (allEntries[i].actionType == _actionType) {
                filteredEntries[index] = allEntries[i];
                index++;
            }
        }
        
        return filteredEntries;
    }

    /**
     * @dev Get count of audit entries for a patient
     * @param _patientId Patient identifier
     * @return uint256 Count of entries
     */
    function getAuditTrailCount(string memory _patientId) 
        external 
        view 
        returns (uint256) 
    {
        return auditTrails[_patientId].length;
    }

    /**
     * @dev Get total number of audit entries
     * @return uint256 Total entries
     */
    function getTotalEntries() external view returns (uint256) {
        return totalEntries;
    }
}

