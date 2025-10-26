// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PatientAccessControl.sol";

/**
 * @title ConsentManager
 * @dev Manages patient consent for data sharing with granular permissions
 * @notice Implements consent granting, revocation, and time-bound access tokens
 */
contract ConsentManager {
    // Reference to PatientAccessControl
    PatientAccessControl public accessControl;
    
    // Permission flags
    uint8 public constant PERMISSION_READ = 1;    // 0b00000001
    uint8 public constant PERMISSION_WRITE = 2;  // 0b00000010
    uint8 public constant PERMISSION_SHARE = 4;   // 0b00000100

    // Consent data structure
    struct Consent {
        address patient;
        address provider;
        uint8 permissions;
        uint256 timestamp;
        uint256 expiry;
        bool active;
    }

    // Mapping: patient => provider => consent
    mapping(address => mapping(address => Consent)) public consents;
    
    // Consent counter for tracking
    uint256 public consentCounter;
    
    /**
     * @dev Constructor to set the PatientAccessControl contract address
     * @param _accessControl Address of the PatientAccessControl contract
     */
    constructor(address _accessControl) {
        require(_accessControl != address(0), "ConsentManager: invalid access control address");
        accessControl = PatientAccessControl(_accessControl);
    }
    
    // Events
    event ConsentGranted(
        address indexed patient,
        address indexed provider,
        uint8 permissions,
        uint256 expiry,
        uint256 consentId
    );
    
    event ConsentRevoked(
        address indexed patient,
        address indexed provider,
        uint256 consentId
    );
    
    event PermissionsUpdated(
        address indexed patient,
        address indexed provider,
        uint8 newPermissions,
        uint256 consentId
    );

    /**
     * @dev Modifier to restrict access to patients only
     */
    modifier onlyPatient() {
        require(accessControl.getUserRole(msg.sender) == accessControl.PATIENT_ROLE(), 
            "ConsentManager: caller must be a patient");
        _;
    }

    /**
     * @dev Grant consent to a provider
     * @param _provider Address of the provider
     * @param _permissions Permission flags (read, write, share)
     * @param _expiryTimestamp Expiry timestamp (0 for indefinite)
     */
    function grantConsent(
        address _provider,
        uint8 _permissions,
        uint256 _expiryTimestamp
    ) 
        external 
        onlyPatient 
    {
        require(_provider != address(0), "ConsentManager: invalid provider address");
        require(_provider != msg.sender, "ConsentManager: cannot grant consent to self");
        require(_permissions > 0, "ConsentManager: must specify at least one permission");
        
        // Check if provider has provider role
        require(
            accessControl.getUserRole(_provider) == accessControl.PROVIDER_ROLE(),
            "ConsentManager: provider must have PROVIDER_ROLE"
        );
        
        Consent storage consent = consents[msg.sender][_provider];
        
        // If consent exists, increment counter
        if (!consent.active) {
            consentCounter++;
        }
        
        consent.patient = msg.sender;
        consent.provider = _provider;
        consent.permissions = _permissions;
        consent.timestamp = block.timestamp;
        consent.expiry = _expiryTimestamp;
        consent.active = true;
        
        emit ConsentGranted(
            msg.sender,
            _provider,
            _permissions,
            _expiryTimestamp,
            consentCounter
        );
    }

    /**
     * @dev Revoke consent from a provider
     * @param _provider Address of the provider
     */
    function revokeConsent(address _provider) 
        external 
        onlyPatient 
    {
        require(_provider != address(0), "ConsentManager: invalid provider address");
        
        Consent storage consent = consents[msg.sender][_provider];
        require(consent.active, "ConsentManager: consent does not exist");
        
        uint256 consentId = _getConsentId(msg.sender, _provider);
        
        consent.active = false;
        
        emit ConsentRevoked(msg.sender, _provider, consentId);
    }

    /**
     * @dev Check if a provider has a specific permission
     * @param _patient Address of the patient
     * @param _provider Address of the provider
     * @param _permission Permission to check
     * @return bool True if provider has the permission
     */
    function checkConsent(
        address _patient,
        address _provider,
        uint8 _permission
    ) 
        external 
        view 
        returns (bool) 
    {
        Consent storage consent = consents[_patient][_provider];
        
        // Check if consent exists and is active
        if (!consent.active) {
            return false;
        }
        
        // Check if consent has expired
        if (consent.expiry != 0 && block.timestamp > consent.expiry) {
            return false;
        }
        
        // Check if specific permission is granted
        return (consent.permissions & _permission) == _permission;
    }

    /**
     * @dev Update permissions for an existing consent
     * @param _provider Address of the provider
     * @param _newPermissions New permission flags
     */
    function updatePermissions(
        address _provider,
        uint8 _newPermissions
    ) 
        external 
        onlyPatient 
    {
        require(_provider != address(0), "ConsentManager: invalid provider address");
        require(_newPermissions > 0, "ConsentManager: must specify at least one permission");
        
        Consent storage consent = consents[msg.sender][_provider];
        require(consent.active, "ConsentManager: consent does not exist");
        
        consent.permissions = _newPermissions;
        
        uint256 consentId = _getConsentId(msg.sender, _provider);
        
        emit PermissionsUpdated(msg.sender, _provider, _newPermissions, consentId);
    }

    /**
     * @dev Get consent details
     * @param _patient Address of the patient
     * @param _provider Address of the provider
     * @return Consent struct with all details
     */
    function getConsent(address _patient, address _provider) 
        external 
        view 
        returns (Consent memory) 
    {
        return consents[_patient][_provider];
    }

    /**
     * @dev Internal function to generate consent ID
     * @param _patient Address of the patient
     * @param _provider Address of the provider
     * @return uint256 Consent ID
     */
    function _getConsentId(address _patient, address _provider) 
        internal 
        view 
        returns (uint256) 
    {
        // Simple hash-based ID generation
        return uint256(keccak256(abi.encodePacked(_patient, _provider, consents[_patient][_provider].timestamp)));
    }
}

