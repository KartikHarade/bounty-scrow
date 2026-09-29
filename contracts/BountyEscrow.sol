// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BountyEscrow
 * @notice Secure on-chain escrow platform for security bounties on Monad.
 * Organizations lock native MON in escrow, researchers submit cryptographic proof of vulnerabilities,
 * and verified findings release payouts directly on-chain.
 */
contract BountyEscrow {
    enum BountyStatus {
        OPEN,
        PAID,
        CANCELLED
    }

    enum SubmissionStatus {
        NONE,
        PENDING,
        REJECTED,
        APPROVED
    }

    struct Bounty {
        uint256 id;
        address payable creator;
        uint256 reward;
        string title;
        uint8 severity; // 1: LOW, 2: MEDIUM, 3: HIGH, 4: CRITICAL
        bytes32 detailsHash;
        BountyStatus status;
    }

    struct Submission {
        address payable researcher;
        bytes32 reportHash;
        SubmissionStatus status;
    }

    uint256 public bountyCounter;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission) public submissions;

    bool private _locked;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        uint256 reward,
        string title,
        uint8 severity,
        bytes32 detailsHash
    );

    event FindingSubmitted(
        uint256 indexed bountyId,
        address indexed researcher,
        bytes32 reportHash
    );

    event BountyPaid(
        uint256 indexed bountyId,
        address indexed researcher,
        uint256 reward
    );

    event FindingRejected(
        uint256 indexed bountyId,
        address indexed researcher
    );

    event BountyCancelled(
        uint256 indexed bountyId,
        uint256 refundAmount
    );

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    /**
     * @notice Creates a new security bounty and locks the native MON reward in escrow.
     * @param title Title or target description of the bounty
     * @param severity Vulnerability severity level (1=Low, 2=Medium, 3=High, 4=Critical)
     * @param detailsHash SHA-256 / Keccak-256 hash of the bounty scope & terms
     */
    function createBounty(
        string calldata title,
        uint8 severity,
        bytes32 detailsHash
    ) external payable returns (uint256) {
        require(msg.value > 0, "Reward must be greater than zero");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(severity >= 1 && severity <= 4, "Invalid severity level");

        bountyCounter++;
        uint256 bountyId = bountyCounter;

        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: payable(msg.sender),
            reward: msg.value,
            title: title,
            severity: severity,
            detailsHash: detailsHash,
            status: BountyStatus.OPEN
        });

        emit BountyCreated(
            bountyId,
            msg.sender,
            msg.value,
            title,
            severity,
            detailsHash
        );

        return bountyId;
    }

    /**
     * @notice Submits a vulnerability finding hash for an open bounty.
     * @param bountyId The ID of the target bounty
     * @param reportHash Cryptographic hash (bytes32) of the vulnerability report
     */
    function submitFinding(uint256 bountyId, bytes32 reportHash) external {
        require(bountyId > 0 && bountyId <= bountyCounter, "Bounty does not exist");
        Bounty storage bounty = bounties[bountyId];

        require(bounty.status == BountyStatus.OPEN, "Bounty is not open");
        require(msg.sender != bounty.creator, "Creator cannot submit finding");
        require(reportHash != bytes32(0), "Invalid report hash");

        Submission storage submission = submissions[bountyId];
        require(
            submission.status != SubmissionStatus.PENDING,
            "Active submission already pending"
        );

        submissions[bountyId] = Submission({
            researcher: payable(msg.sender),
            reportHash: reportHash,
            status: SubmissionStatus.PENDING
        });

        emit FindingSubmitted(bountyId, msg.sender, reportHash);
    }

    /**
     * @notice Approves a pending finding and releases the escrowed reward to the researcher.
     * @param bountyId The ID of the bounty to approve
     */
    function approveFinding(uint256 bountyId) external nonReentrant {
        require(bountyId > 0 && bountyId <= bountyCounter, "Bounty does not exist");
        Bounty storage bounty = bounties[bountyId];

        require(msg.sender == bounty.creator, "Only creator can approve");
        require(bounty.status == BountyStatus.OPEN, "Bounty is not open");

        Submission storage submission = submissions[bountyId];
        require(
            submission.status == SubmissionStatus.PENDING,
            "No pending submission to approve"
        );

        // State changes (checks-effects-interactions)
        bounty.status = BountyStatus.PAID;
        submission.status = SubmissionStatus.APPROVED;
        uint256 payout = bounty.reward;
        address payable researcher = submission.researcher;

        (bool sent, ) = researcher.call{value: payout}("");
        require(sent, "Payout transfer failed");

        emit BountyPaid(bountyId, researcher, payout);
    }

    /**
     * @notice Rejects a pending finding and resets the bounty back to open for new submissions.
     * @param bountyId The ID of the bounty with pending submission
     */
    function rejectFinding(uint256 bountyId) external {
        require(bountyId > 0 && bountyId <= bountyCounter, "Bounty does not exist");
        Bounty storage bounty = bounties[bountyId];

        require(msg.sender == bounty.creator, "Only creator can reject");
        require(bounty.status == BountyStatus.OPEN, "Bounty is not open");

        Submission storage submission = submissions[bountyId];
        require(
            submission.status == SubmissionStatus.PENDING,
            "No pending submission to reject"
        );

        address rejectedResearcher = submission.researcher;
        submission.status = SubmissionStatus.REJECTED;

        emit FindingRejected(bountyId, rejectedResearcher);
    }

    /**
     * @notice Cancels an open bounty and refunds the escrowed reward to the creator.
     * Blocked if there is a pending submission under review.
     * @param bountyId The ID of the bounty to cancel
     */
    function cancelBounty(uint256 bountyId) external nonReentrant {
        require(bountyId > 0 && bountyId <= bountyCounter, "Bounty does not exist");
        Bounty storage bounty = bounties[bountyId];

        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.status == BountyStatus.OPEN, "Bounty is not open");

        Submission storage submission = submissions[bountyId];
        require(
            submission.status != SubmissionStatus.PENDING,
            "Cannot cancel while submission is pending"
        );

        // State changes (checks-effects-interactions)
        bounty.status = BountyStatus.CANCELLED;
        uint256 refund = bounty.reward;

        (bool sent, ) = bounty.creator.call{value: refund}("");
        require(sent, "Refund transfer failed");

        emit BountyCancelled(bountyId, refund);
    }

    /**
     * @notice Returns bounty details by ID.
     */
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        require(bountyId > 0 && bountyId <= bountyCounter, "Bounty does not exist");
        return bounties[bountyId];
    }

    /**
     * @notice Returns the latest submission for a given bounty.
     */
    function getSubmission(uint256 bountyId) external view returns (Submission memory) {
        require(bountyId > 0 && bountyId <= bountyCounter, "Bounty does not exist");
        return submissions[bountyId];
    }

    /**
     * @notice Returns total number of bounties created.
     */
    function getBountiesCount() external view returns (uint256) {
        return bountyCounter;
    }

    /**
     * @notice Returns all bounties in a single call for efficient client-side indexing.
     */
    function getAllBounties() external view returns (Bounty[] memory) {
        Bounty[] memory all = new Bounty[](bountyCounter);
        for (uint256 i = 1; i <= bountyCounter; i++) {
            all[i - 1] = bounties[i];
        }
        return all;
    }
}
