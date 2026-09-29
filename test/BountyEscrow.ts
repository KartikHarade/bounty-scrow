import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { BountyEscrow } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BountyEscrow Contract", function () {
  let bountyEscrow: BountyEscrow;
  let creator: HardhatEthersSigner;
  let researcher: HardhatEthersSigner;
  let researcher2: HardhatEthersSigner;
  let attacker: HardhatEthersSigner;

  const sampleTitle = "Critical Vulnerability in Payment Gateway";
  const sampleSeverity = 4; // Critical
  const sampleDetailsHash = ethers.keccak256(ethers.toUtf8Bytes("Scope terms and details"));
  const sampleReportHash = ethers.keccak256(ethers.toUtf8Bytes("Exploit POC and report text"));
  const sampleReportHash2 = ethers.keccak256(ethers.toUtf8Bytes("Second updated exploit POC"));
  const oneEther = ethers.parseEther("1.0");

  beforeEach(async function () {
    [creator, researcher, researcher2, attacker] = await ethers.getSigners();

    const BountyEscrowFactory = await ethers.getContractFactory("BountyEscrow");
    bountyEscrow = (await BountyEscrowFactory.deploy()) as BountyEscrow;
    await bountyEscrow.waitForDeployment();
  });

  describe("1 & 2. Bounty Creation & Exact Reward Escrow", function () {
    it("should allow creator to create a bounty and lock exact funds in escrow", async function () {
      const contractAddress = await bountyEscrow.getAddress();
      const initialContractBalance = await ethers.provider.getBalance(contractAddress);
      expect(initialContractBalance).to.equal(0n);

      const tx = await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );

      await expect(tx)
        .to.emit(bountyEscrow, "BountyCreated")
        .withArgs(1n, creator.address, oneEther, sampleTitle, sampleSeverity, sampleDetailsHash);

      const contractBalanceAfter = await ethers.provider.getBalance(contractAddress);
      expect(contractBalanceAfter).to.equal(oneEther);

      const bounty = await bountyEscrow.getBounty(1);
      expect(bounty.id).to.equal(1n);
      expect(bounty.creator).to.equal(creator.address);
      expect(bounty.reward).to.equal(oneEther);
      expect(bounty.title).to.equal(sampleTitle);
      expect(bounty.severity).to.equal(sampleSeverity);
      expect(bounty.status).to.equal(0n); // OPEN

      expect(await bountyEscrow.getBountiesCount()).to.equal(1n);
    });

    it("3. should reject bounty creation with zero value", async function () {
      await expect(
        bountyEscrow.connect(creator).createBounty(
          sampleTitle,
          sampleSeverity,
          sampleDetailsHash,
          { value: 0n }
        )
      ).to.be.revertedWith("Reward must be greater than zero");
    });

    it("should reject bounty creation with empty title or invalid severity", async function () {
      await expect(
        bountyEscrow.connect(creator).createBounty(
          "",
          sampleSeverity,
          sampleDetailsHash,
          { value: oneEther }
        )
      ).to.be.revertedWith("Title cannot be empty");

      await expect(
        bountyEscrow.connect(creator).createBounty(
          sampleTitle,
          0,
          sampleDetailsHash,
          { value: oneEther }
        )
      ).to.be.revertedWith("Invalid severity level");
    });
  });

  describe("4 & 5. Researcher Submission & Creator Self-Submission", function () {
    beforeEach(async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
    });

    it("4. should allow researcher to submit finding", async function () {
      const tx = await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);

      await expect(tx)
        .to.emit(bountyEscrow, "FindingSubmitted")
        .withArgs(1n, researcher.address, sampleReportHash);

      const submission = await bountyEscrow.getSubmission(1);
      expect(submission.researcher).to.equal(researcher.address);
      expect(submission.reportHash).to.equal(sampleReportHash);
      expect(submission.status).to.equal(1n); // PENDING
    });

    it("5. should prevent creator from submitting finding to own bounty", async function () {
      await expect(
        bountyEscrow.connect(creator).submitFinding(1, sampleReportHash)
      ).to.be.revertedWith("Creator cannot submit finding");
    });

    it("should reject duplicate pending submission on the same bounty", async function () {
      await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);

      await expect(
        bountyEscrow.connect(researcher2).submitFinding(1, sampleReportHash2)
      ).to.be.revertedWith("Active submission already pending");
    });
  });

  describe("6 & 7. Approval & Payout", function () {
    beforeEach(async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
      await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);
    });

    it("6 & 7. should allow creator to approve finding and transfer payout to researcher", async function () {
      const initialResearcherBalance = await ethers.provider.getBalance(researcher.address);

      const tx = await bountyEscrow.connect(creator).approveFinding(1);

      await expect(tx)
        .to.emit(bountyEscrow, "BountyPaid")
        .withArgs(1n, researcher.address, oneEther);

      const finalResearcherBalance = await ethers.provider.getBalance(researcher.address);
      expect(finalResearcherBalance - initialResearcherBalance).to.equal(oneEther);

      const bounty = await bountyEscrow.getBounty(1);
      expect(bounty.status).to.equal(1n); // PAID

      const submission = await bountyEscrow.getSubmission(1);
      expect(submission.status).to.equal(3n); // APPROVED
    });

    it("8. should prevent double payout after approval", async function () {
      await bountyEscrow.connect(creator).approveFinding(1);

      await expect(
        bountyEscrow.connect(creator).approveFinding(1)
      ).to.be.revertedWith("Bounty is not open");
    });
  });

  describe("9 & 10. Rejection & Reopening", function () {
    beforeEach(async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
      await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);
    });

    it("9. should allow creator to reject pending finding", async function () {
      const tx = await bountyEscrow.connect(creator).rejectFinding(1);

      await expect(tx)
        .to.emit(bountyEscrow, "FindingRejected")
        .withArgs(1n, researcher.address);

      const submission = await bountyEscrow.getSubmission(1);
      expect(submission.status).to.equal(2n); // REJECTED

      const bounty = await bountyEscrow.getBounty(1);
      expect(bounty.status).to.equal(0n); // Still OPEN
    });

    it("10. should allow new submission after previous finding is rejected (reopening)", async function () {
      await bountyEscrow.connect(creator).rejectFinding(1);

      // Now researcher 2 or even original researcher can submit revised finding
      await expect(
        bountyEscrow.connect(researcher2).submitFinding(1, sampleReportHash2)
      )
        .to.emit(bountyEscrow, "FindingSubmitted")
        .withArgs(1n, researcher2.address, sampleReportHash2);

      const submission = await bountyEscrow.getSubmission(1);
      expect(submission.researcher).to.equal(researcher2.address);
      expect(submission.status).to.equal(1n); // PENDING
    });
  });

  describe("11 & 12. Cancellation & Pending Blocks Cancellation", function () {
    it("11. should allow creator to cancel open bounty and receive full refund", async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );

      const balanceBefore = await ethers.provider.getBalance(creator.address);

      const tx = await bountyEscrow.connect(creator).cancelBounty(1);
      const receipt = await tx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(bountyEscrow, "BountyCancelled")
        .withArgs(1n, oneEther);

      const balanceAfter = await ethers.provider.getBalance(creator.address);
      expect(balanceAfter).to.equal(balanceBefore + oneEther - gasSpent);

      const bounty = await bountyEscrow.getBounty(1);
      expect(bounty.status).to.equal(2n); // CANCELLED
    });

    it("12. should block cancellation if a submission is pending review", async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
      await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);

      await expect(
        bountyEscrow.connect(creator).cancelBounty(1)
      ).to.be.revertedWith("Cannot cancel while submission is pending");
    });
  });

  describe("13 & 14. Unauthorized Actions", function () {
    beforeEach(async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
      await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);
    });

    it("13. should revert unauthorized approval from non-creator", async function () {
      await expect(
        bountyEscrow.connect(attacker).approveFinding(1)
      ).to.be.revertedWith("Only creator can approve");
    });

    it("14. should revert unauthorized cancellation from non-creator", async function () {
      await expect(
        bountyEscrow.connect(attacker).cancelBounty(1)
      ).to.be.revertedWith("Only creator can cancel");
    });

    it("should revert unauthorized rejection from non-creator", async function () {
      await expect(
        bountyEscrow.connect(attacker).rejectFinding(1)
      ).to.be.revertedWith("Only creator can reject");
    });
  });

  describe("15 & 16. Reuse Protection for Finalized Bounties", function () {
    it("15. paid bounty cannot be reused or submitted to", async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
      await bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash);
      await bountyEscrow.connect(creator).approveFinding(1);

      await expect(
        bountyEscrow.connect(researcher2).submitFinding(1, sampleReportHash2)
      ).to.be.revertedWith("Bounty is not open");

      await expect(
        bountyEscrow.connect(creator).cancelBounty(1)
      ).to.be.revertedWith("Bounty is not open");
    });

    it("16. cancelled bounty cannot be reused or submitted to", async function () {
      await bountyEscrow.connect(creator).createBounty(
        sampleTitle,
        sampleSeverity,
        sampleDetailsHash,
        { value: oneEther }
      );
      await bountyEscrow.connect(creator).cancelBounty(1);

      await expect(
        bountyEscrow.connect(researcher).submitFinding(1, sampleReportHash)
      ).to.be.revertedWith("Bounty is not open");

      await expect(
        bountyEscrow.connect(creator).approveFinding(1)
      ).to.be.revertedWith("Bounty is not open");
    });
  });
});
