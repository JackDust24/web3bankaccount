// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "hardhat/console.sol";

contract BankAccount {
    // EVENTS
    event Deposit(
        address indexed user,
        uint256 indexed accountId,
        uint256 value,
        uint256 timestamp
    );
    event WithdrawRequested(
        address indexed user,
        uint256 indexed accountId,
        uint256 indexed withdrawId,
        uint256 amount,
        uint256 timestamp
    );
    event Withdraw(uint256 indexed withdrawId, uint256 timestamp);
    event AccountCreated(
        address[] owners,
        uint256 indexed id,
        uint256 timestamp
    );

    // Structs
    struct WithdrawRequest {
        address user;
        uint256 amount;
        uint256 approvals;
        mapping(address => bool) ownersApproved;
        bool approved;
    }

    struct Account {
        address[] owners;
        uint256 balance;
        mapping(uint256 => WithdrawRequest) withdrawRequests;
    }

    // Mappings and variables
    mapping(uint256 => Account) accounts;
    mapping(address => uint256[]) userAccounts;

    uint256 nextAccountId;
    uint256 nextWithdrawId;

    modifier ownerOfAccount(uint256 accountId) {
        bool isAccountOwner;
        for (uint256 idx; idx < accounts[accountId].owners.length; idx++) {
            if (accounts[accountId].owners[idx] == msg.sender) {
                isAccountOwner = true;
                break;
            }
        }
        require(isAccountOwner, "You aren't the owner of this account");
        _;
    }

    modifier validOwners(address[] calldata owners) {
        console.log("validOwners");
        require(owners.length + 1 <= 4, "Maximum of 4 owners per account");
        for (uint256 idx; idx < owners.length; idx++) {
            if (owners[idx] == msg.sender) {
                revert("no duplicate owners");
            }
            // Check if no other duplicates in array
            for (uint256 j = idx + 1; j < owners.length; j++) {
                if (owners[idx] == owners[j]) {
                    revert("No duplicate owners please");
                }
            }
        }
        _;
    }

    modifier sufficentBalance(uint256 accountId, uint256 amount) {
        require(accounts[accountId].balance >= amount, "Insufficient balance");
        _;
    }

    modifier canApprove(uint256 accountId, uint256 withdrawId) {
        require(
            !accounts[accountId].withdrawRequests[withdrawId].approved,
            "this request is already approved"
        );
        require(
            accounts[accountId].withdrawRequests[withdrawId].user != msg.sender,
            "you cannot approve this request"
        );
        require(
            accounts[accountId].withdrawRequests[withdrawId].user != address(0),
            "this request does not exist"
        );
        require(
            !accounts[accountId].withdrawRequests[withdrawId].ownersApproved[
                msg.sender
            ],
            "you have already approved this request"
        );
        _;
    }

    modifier canWithdraw(uint256 accountId, uint256 withdrawId) {
        require(
            accounts[accountId].withdrawRequests[withdrawId].user == msg.sender,
            "you did not create this request"
        );
        require(
            accounts[accountId].withdrawRequests[withdrawId].approved,
            "this request is not approved"
        );
        _;
    }

    // Functions
    function deposit(
        uint256 accountId
    ) external payable ownerOfAccount(accountId) {
        accounts[accountId].balance += msg.value;
    }

    function createAccount(
        address[] calldata otherOwners
    ) external validOwners(otherOwners) {
        console.log("createAccount called");

        address[] memory owners = new address[](otherOwners.length + 1);
        owners[otherOwners.length] = msg.sender;

        uint256 id = nextAccountId;
        // Make sure they dont have an account already

        for (uint256 idx; idx < owners.length; idx++) {
            // As we have already added ourselves to the array, we then copy the argument otherOwners in
            if (idx < owners.length - 1) {
                owners[idx] = otherOwners[idx];
            }

            // To prevent having more than 3 accounts
            if (userAccounts[owners[idx]].length > 2) {
                revert("Each user can have a maximum of 3 accounts");
            }

            userAccounts[owners[idx]].push(id);
        }

        accounts[id].owners = owners;
        nextAccountId++;
        emit AccountCreated(owners, id, block.timestamp);
    }

    function requestWithdrawl(
        uint256 accountId,
        uint256 amount
    ) external ownerOfAccount(accountId) sufficentBalance(accountId, amount) {
        uint256 id = nextWithdrawId;

        WithdrawRequest storage request = accounts[accountId].withdrawRequests[
            id
        ];

        request.user = msg.sender;
        request.amount = amount;
        nextWithdrawId++;
        emit WithdrawRequested(
            msg.sender,
            accountId,
            id,
            amount,
            block.timestamp
        );
    }

    function approveWithdrawl(
        uint256 accountId,
        uint256 withdrawId
    ) external ownerOfAccount(accountId) canApprove(accountId, withdrawId) {
        WithdrawRequest storage request = accounts[accountId].withdrawRequests[
            withdrawId
        ];
        request.approvals++;
        request.ownersApproved[msg.sender] = true;

        // Reason for minus one we don't want to count the person who did the request
        if (request.approvals == accounts[accountId].owners.length - 1) {
            request.approved = true;
        }
    }

    function withdraw(
        uint256 accountId,
        uint256 withdrawId
    ) external canWithdraw(accountId, withdrawId) {
        // Need to check balance is right
        uint256 amount = accounts[accountId]
            .withdrawRequests[withdrawId]
            .amount;
        require(accounts[accountId].balance >= amount, "insufficient balance");

        accounts[accountId].balance -= amount;
        delete accounts[accountId].withdrawRequests[withdrawId];

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent);

        emit Withdraw(withdrawId, block.timestamp);
    }

    function getBalance(uint256 accountId) public view returns (uint256) {
        return accounts[accountId].balance;
    }

    function getOwners(
        uint256 accountId
    ) public view returns (address[] memory) {
        return accounts[accountId].owners;
    }

    function getApprovals(
        uint256 accountId,
        uint256 withdrawId
    ) public view returns (uint256) {
        return accounts[accountId].withdrawRequests[withdrawId].approvals;
    }

    function getAccounts() public view returns (uint256[] memory) {
        console.log("getAccounts called");
        return userAccounts[msg.sender];
    }

    function getTest() public pure returns (string memory) {
        return "Hello World";
    }
}
