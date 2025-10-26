// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PatientAccessControl
 * @dev Role-based access control for Patient, Provider, and Admin roles
 * @notice Manages user roles and permissions within the patient history system
 */
contract PatientAccessControl is Pausable {
    // Role identifiers
    bytes32 public constant PATIENT_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000001;
    bytes32 public constant PROVIDER_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000002;
    bytes32 public constant ADMIN_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000003;

    // Role mapping: address => role
    mapping(address => bytes32) public roles;

    // Events
    event RoleAssigned(address indexed user, bytes32 indexed role);
    event RoleRevoked(address indexed user, bytes32 indexed role);
    event EmergencyPause();
    event EmergencyUnpause();

    /**
     * @dev Constructor to grant admin role to deployer
     */
    constructor() {
        roles[msg.sender] = ADMIN_ROLE;
        emit RoleAssigned(msg.sender, ADMIN_ROLE);
    }

    /**
     * @dev Modifier to restrict access to patients only
     */
    modifier onlyPatient() {
        require(roles[msg.sender] == PATIENT_ROLE, "AccessControl: caller must be a patient");
        _;
    }

    /**
     * @dev Modifier to restrict access to providers only
     */
    modifier onlyProvider() {
        require(roles[msg.sender] == PROVIDER_ROLE, "AccessControl: caller must be a provider");
        _;
    }

    /**
     * @dev Modifier to restrict access to admins only
     */
    modifier onlyAdmin() {
        require(roles[msg.sender] == ADMIN_ROLE, "AccessControl: caller must be an admin");
        _;
    }

    /**
     * @dev Assign a role to an address
     * @param _user Address to assign role to
     * @param _role Role to assign
     */
    function assignRole(address _user, bytes32 _role) 
        external 
        onlyAdmin 
        whenNotPaused 
    {
        require(_user != address(0), "AccessControl: invalid address");
        require(_role != bytes32(0), "AccessControl: invalid role");
        
        roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }

    /**
     * @dev Revoke a role from an address
     * @param _user Address to revoke role from
     */
    function revokeRole(address _user) 
        external 
        onlyAdmin 
        whenNotPaused 
    {
        require(_user != address(0), "AccessControl: invalid address");
        
        bytes32 oldRole = roles[_user];
        roles[_user] = bytes32(0);
        emit RoleRevoked(_user, oldRole);
    }

    /**
     * @dev Check if an address has a specific role
     * @param _user Address to check
     * @param _role Role to verify
     * @return bool True if user has the role
     */
    function hasRole(address _user, bytes32 _role) 
        external 
        view 
        returns (bool) 
    {
        return roles[_user] == _role;
    }

    /**
     * @dev Get the role of an address
     * @param _user Address to query
     * @return bytes32 The role of the address
     */
    function getUserRole(address _user) 
        external 
        view 
        returns (bytes32) 
    {
        return roles[_user];
    }

    /**
     * @dev Pause the contract in case of emergency
     */
    function pause() external onlyAdmin {
        _pause();
        emit EmergencyPause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyAdmin {
        _unpause();
        emit EmergencyUnpause();
    }
}

