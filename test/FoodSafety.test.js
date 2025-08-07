const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnonymousFoodSafety", function () {
  // Fixture for deploying the contract
  async function deployFoodSafetyFixture() {
    const [owner, regulator, investigator1, investigator2, reporter1, reporter2, reporter3] =
      await ethers.getSigners();

    const AnonymousFoodSafety = await ethers.getContractFactory("AnonymousFoodSafety");
    const foodSafety = await AnonymousFoodSafety.deploy();

    return {
      foodSafety,
      owner,
      regulator,
      investigator1,
      investigator2,
      reporter1,
      reporter2,
      reporter3,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { foodSafety, owner } = await loadFixture(deployFoodSafetyFixture);
      expect(await foodSafety.owner()).to.equal(owner.address);
    });

    it("Should set the correct regulator", async function () {
      const { foodSafety, owner } = await loadFixture(deployFoodSafetyFixture);
      expect(await foodSafety.regulator()).to.equal(owner.address);
    });

    it("Should initialize with zero reports", async function () {
      const { foodSafety } = await loadFixture(deployFoodSafetyFixture);
      expect(await foodSafety.totalReports()).to.equal(0);
    });
  });

  describe("Regulator Management", function () {
    it("Should allow owner to set regulator", async function () {
      const { foodSafety, owner, regulator } = await loadFixture(deployFoodSafetyFixture);
      await foodSafety.connect(owner).setRegulator(regulator.address);
      expect(await foodSafety.regulator()).to.equal(regulator.address);
    });

    it("Should not allow non-owner to set regulator", async function () {
      const { foodSafety, reporter1, regulator } = await loadFixture(deployFoodSafetyFixture);
      await expect(
        foodSafety.connect(reporter1).setRegulator(regulator.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Investigator Authorization", function () {
    it("Should allow regulator to authorize investigator", async function () {
      const { foodSafety, owner, investigator1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(foodSafety.connect(owner).authorizeInvestigator(investigator1.address))
        .to.emit(foodSafety, "InvestigatorAuthorized")
        .withArgs(investigator1.address);

      expect(await foodSafety.authorizedInvestigators(investigator1.address)).to.be.true;
    });

    it("Should allow regulator to revoke investigator", async function () {
      const { foodSafety, owner, investigator1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);

      await expect(foodSafety.connect(owner).revokeInvestigator(investigator1.address))
        .to.emit(foodSafety, "InvestigatorRevoked")
        .withArgs(investigator1.address);

      expect(await foodSafety.authorizedInvestigators(investigator1.address)).to.be.false;
    });

    it("Should not allow non-regulator to authorize investigator", async function () {
      const { foodSafety, reporter1, investigator1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).authorizeInvestigator(investigator1.address)
      ).to.be.revertedWith("Not regulator");
    });
  });

  describe("Anonymous Report Submission", function () {
    it("Should allow anyone to submit a report", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          3, // Danger level
          1001, // Location code
          5001, // Food type code
          "Expired ingredients found"
        )
      ).to.emit(foodSafety, "ReportSubmitted");

      expect(await foodSafety.totalReports()).to.equal(1);
    });

    it("Should increment total reports counter", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(
        2, 1001, 5001, "Issue 1"
      );
      await foodSafety.connect(reporter2).submitAnonymousReport(
        3, 1002, 5002, "Issue 2"
      );

      expect(await foodSafety.totalReports()).to.equal(2);
    });

    it("Should reject invalid safety level", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          5, // Invalid level (max is 4)
          1001,
          5001,
          "Invalid report"
        )
      ).to.be.revertedWith("Invalid safety level");
    });

    it("Should track reporter history", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue 1");
      await foodSafety.connect(reporter1).submitAnonymousReport(3, 1002, 5002, "Issue 2");

      const reportCount = await foodSafety.getReporterStats(reporter1.address);
      expect(reportCount).to.equal(2);
    });

    it("Should update location statistics", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      const locationStats = await foodSafety.getLocationStats(1001);
      expect(locationStats.totalReports).to.equal(1);
    });
  });

  describe("Report Status Management", function () {
    it("Should allow regulator to update report status", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      await expect(foodSafety.connect(owner).updateReportStatus(1, 1)) // UnderReview
        .to.emit(foodSafety, "ReportStatusChanged")
        .withArgs(1, 1);

      const reportInfo = await foodSafety.getReportInfo(1);
      expect(reportInfo.status).to.equal(1);
    });

    it("Should not allow non-regulator to update status", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      await expect(
        foodSafety.connect(reporter2).updateReportStatus(1, 1)
      ).to.be.revertedWith("Not regulator");
    });

    it("Should update lastUpdated timestamp", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      const initialInfo = await foodSafety.getReportInfo(1);

      await foodSafety.connect(owner).updateReportStatus(1, 1);
      const updatedInfo = await foodSafety.getReportInfo(1);

      expect(updatedInfo.lastUpdated).to.be.gt(initialInfo.lastUpdated);
    });
  });

  describe("Investigation Workflow", function () {
    it("Should allow authorized investigator to start investigation", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      await expect(foodSafety.connect(investigator1).startInvestigation(1))
        .to.emit(foodSafety, "InvestigationStarted")
        .withArgs(1, investigator1.address);

      const investigationInfo = await foodSafety.getInvestigationInfo(1);
      expect(investigationInfo.investigator).to.equal(investigator1.address);
      expect(investigationInfo.isComplete).to.be.false;
    });

    it("Should not allow unauthorized person to start investigation", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      await expect(
        foodSafety.connect(reporter2).startInvestigation(1)
      ).to.be.revertedWith("Not authorized investigator");
    });

    it("Should update report status when investigation starts", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      await foodSafety.connect(investigator1).startInvestigation(1);

      const reportInfo = await foodSafety.getReportInfo(1);
      expect(reportInfo.status).to.equal(2); // Investigating
    });

    it("Should allow investigator to complete investigation", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      await foodSafety.connect(investigator1).startInvestigation(1);

      await expect(
        foodSafety.connect(investigator1).completeInvestigation(1, 2, "Issue resolved")
      )
        .to.emit(foodSafety, "InvestigationCompleted")
        .withArgs(1, 2);

      const investigationInfo = await foodSafety.getInvestigationInfo(1);
      expect(investigationInfo.isComplete).to.be.true;
      expect(investigationInfo.findings).to.equal("Issue resolved");
    });

    it("Should mark report as processed when investigation completes", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      await foodSafety.connect(investigator1).startInvestigation(1);
      await foodSafety.connect(investigator1).completeInvestigation(1, 2, "Resolved");

      const reportInfo = await foodSafety.getReportInfo(1);
      expect(reportInfo.isProcessed).to.be.true;
      expect(reportInfo.status).to.equal(3); // Resolved
    });

    it("Should not allow completing already completed investigation", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      await foodSafety.connect(investigator1).startInvestigation(1);
      await foodSafety.connect(investigator1).completeInvestigation(1, 2, "Resolved");

      await expect(
        foodSafety.connect(investigator1).completeInvestigation(1, 2, "Resolved again")
      ).to.be.revertedWith("Investigation already complete");
    });
  });

  describe("Statistics and Queries", function () {
    it("Should return correct total statistics", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue 1");
      await foodSafety.connect(reporter2).submitAnonymousReport(3, 1002, 5002, "Issue 2");

      const stats = await foodSafety.getTotalStats();
      expect(stats.total).to.equal(2);
      expect(stats.submitted).to.equal(2);
    });

    it("Should track reports by status correctly", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue 1");
      await foodSafety.connect(reporter1).submitAnonymousReport(3, 1002, 5002, "Issue 2");

      await foodSafety.connect(owner).updateReportStatus(1, 1); // UnderReview
      await foodSafety.connect(investigator1).startInvestigation(2); // Investigating

      const stats = await foodSafety.getTotalStats();
      expect(stats.total).to.equal(2);
      expect(stats.underReview).to.equal(1);
      expect(stats.investigating).to.equal(1);
    });

    it("Should return correct location statistics", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue 1");
      await foodSafety.connect(reporter2).submitAnonymousReport(3, 1001, 5002, "Issue 2");

      const locationStats = await foodSafety.getLocationStats(1001);
      expect(locationStats.totalReports).to.equal(2);
    });

    it("Should return correct reporter statistics", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue 1");
      await foodSafety.connect(reporter1).submitAnonymousReport(3, 1002, 5002, "Issue 2");
      await foodSafety.connect(reporter1).submitAnonymousReport(1, 1003, 5003, "Issue 3");

      const reporterStats = await foodSafety.getReporterStats(reporter1.address);
      expect(reporterStats).to.equal(3);
    });
  });

  describe("Batch Operations", function () {
    it("Should allow batch status updates", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue 1");
      await foodSafety.connect(reporter1).submitAnonymousReport(3, 1002, 5002, "Issue 2");
      await foodSafety.connect(reporter1).submitAnonymousReport(1, 1003, 5003, "Issue 3");

      await foodSafety.connect(owner).batchUpdateStatus([1, 2, 3], 1); // UnderReview

      const report1 = await foodSafety.getReportInfo(1);
      const report2 = await foodSafety.getReportInfo(2);
      const report3 = await foodSafety.getReportInfo(3);

      expect(report1.status).to.equal(1);
      expect(report2.status).to.equal(1);
      expect(report3.status).to.equal(1);
    });

    it("Should not allow non-regulator to batch update", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      await expect(
        foodSafety.connect(reporter2).batchUpdateStatus([1], 1)
      ).to.be.revertedWith("Not regulator");
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow owner to emergency close report", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      await foodSafety.connect(owner).emergencyCloseReport(1, "Spam report");

      const reportInfo = await foodSafety.getReportInfo(1);
      expect(reportInfo.status).to.equal(4); // Closed
      expect(reportInfo.isValid).to.be.false;
    });

    it("Should not allow non-owner to emergency close", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");

      await expect(
        foodSafety.connect(reporter2).emergencyCloseReport(1, "Reason")
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Report Information Retrieval", function () {
    it("Should return correct report information", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Test issue");

      const reportInfo = await foodSafety.getReportInfo(1);
      expect(reportInfo.status).to.equal(0); // Submitted
      expect(reportInfo.isProcessed).to.be.false;
      expect(reportInfo.isValid).to.be.true;
    });

    it("Should return correct investigation information", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Issue");
      await foodSafety.connect(investigator1).startInvestigation(1);

      const investigationInfo = await foodSafety.getInvestigationInfo(1);
      expect(investigationInfo.investigator).to.equal(investigator1.address);
      expect(investigationInfo.isComplete).to.be.false;
    });
  });
});
