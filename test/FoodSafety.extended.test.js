const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnonymousFoodSafety - Extended Tests", function () {
  async function deployFoodSafetyFixture() {
    const [owner, regulator, investigator1, investigator2, reporter1, reporter2, reporter3, reporter4] =
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
      reporter4,
    };
  }

  describe("Edge Cases and Boundary Tests", function () {
    it("Should handle minimum safety level (0)", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          0, // Unknown safety level
          1001,
          5001,
          "Unknown safety concern"
        )
      ).to.emit(foodSafety, "ReportSubmitted");

      expect(await foodSafety.totalReports()).to.equal(1);
    });

    it("Should handle maximum safety level (4)", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          4, // Critical level
          1001,
          5001,
          "Critical food safety violation"
        )
      ).to.emit(foodSafety, "ReportSubmitted");
    });

    it("Should reject safety level above maximum (5)", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          5,
          1001,
          5001,
          "Invalid report"
        )
      ).to.be.revertedWith("Invalid safety level");
    });

    it("Should handle empty description string", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          2,
          1001,
          5001,
          "" // Empty description
        )
      ).to.emit(foodSafety, "ReportSubmitted");
    });

    it("Should handle very long description string", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      const longDescription = "A".repeat(1000);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          2,
          1001,
          5001,
          longDescription
        )
      ).to.emit(foodSafety, "ReportSubmitted");
    });

    it("Should handle zero location code", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          2,
          0, // Zero location
          5001,
          "Report with zero location"
        )
      ).to.emit(foodSafety, "ReportSubmitted");
    });

    it("Should handle zero food type code", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          2,
          1001,
          0, // Zero food type
          "Report with zero food type"
        )
      ).to.emit(foodSafety, "ReportSubmitted");
    });

    it("Should handle maximum uint32 values for codes", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      const maxUint32 = 4294967295; // 2^32 - 1

      await expect(
        foodSafety.connect(reporter1).submitAnonymousReport(
          2,
          maxUint32,
          maxUint32,
          "Report with max values"
        )
      ).to.emit(foodSafety, "ReportSubmitted");
    });
  });

  describe("Multiple Reports Workflow", function () {
    it("Should handle multiple reports from same reporter", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      for (let i = 0; i < 5; i++) {
        await foodSafety.connect(reporter1).submitAnonymousReport(
          2, 1001, 5001, `Report ${i + 1}`
        );
      }

      expect(await foodSafety.totalReports()).to.equal(5);
      const reportCount = await foodSafety.getReporterStats(reporter1.address);
      expect(reportCount).to.equal(5);
    });

    it("Should handle multiple reporters submitting reports", async function () {
      const { foodSafety, reporter1, reporter2, reporter3 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report 1");
      await foodSafety.connect(reporter2).submitAnonymousReport(3, 1002, 5002, "Report 2");
      await foodSafety.connect(reporter3).submitAnonymousReport(1, 1003, 5003, "Report 3");

      expect(await foodSafety.totalReports()).to.equal(3);
      expect(await foodSafety.getReporterStats(reporter1.address)).to.equal(1);
      expect(await foodSafety.getReporterStats(reporter2.address)).to.equal(1);
      expect(await foodSafety.getReporterStats(reporter3.address)).to.equal(1);
    });

    it("Should track reports at same location", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      const locationCode = 1001;

      await foodSafety.connect(reporter1).submitAnonymousReport(2, locationCode, 5001, "Report 1");
      await foodSafety.connect(reporter2).submitAnonymousReport(3, locationCode, 5002, "Report 2");

      const locationStats = await foodSafety.getLocationStats(locationCode);
      expect(locationStats.totalReports).to.equal(2);
    });
  });

  describe("Investigation Status Transitions", function () {
    it("Should not allow starting investigation on closed report", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report");
      await foodSafety.connect(owner).emergencyCloseReport(1, "Spam");

      await expect(
        foodSafety.connect(investigator1).startInvestigation(1)
      ).to.be.reverted;
    });

    it("Should allow investigation after status update to UnderReview", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report");
      await foodSafety.connect(owner).updateReportStatus(1, 1); // UnderReview

      await expect(
        foodSafety.connect(investigator1).startInvestigation(1)
      ).to.emit(foodSafety, "InvestigationStarted");
    });

    it("Should maintain investigation data after completion", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report");
      await foodSafety.connect(investigator1).startInvestigation(1);

      const findings = "Investigation complete. No violations found.";
      await foodSafety.connect(investigator1).completeInvestigation(1, 1, findings);

      const investigationInfo = await foodSafety.getInvestigationInfo(1);
      expect(investigationInfo.findings).to.equal(findings);
      expect(investigationInfo.isComplete).to.be.true;
    });
  });

  describe("Multi-Investigator Scenarios", function () {
    it("Should allow multiple investigators to be authorized", async function () {
      const { foodSafety, owner, investigator1, investigator2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(owner).authorizeInvestigator(investigator2.address);

      expect(await foodSafety.authorizedInvestigators(investigator1.address)).to.be.true;
      expect(await foodSafety.authorizedInvestigators(investigator2.address)).to.be.true;
    });

    it("Should allow different investigators to handle different reports", async function () {
      const { foodSafety, owner, investigator1, investigator2, reporter1, reporter2 } =
        await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(owner).authorizeInvestigator(investigator2.address);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report 1");
      await foodSafety.connect(reporter2).submitAnonymousReport(3, 1002, 5002, "Report 2");

      await foodSafety.connect(investigator1).startInvestigation(1);
      await foodSafety.connect(investigator2).startInvestigation(2);

      const inv1Info = await foodSafety.getInvestigationInfo(1);
      const inv2Info = await foodSafety.getInvestigationInfo(2);

      expect(inv1Info.investigator).to.equal(investigator1.address);
      expect(inv2Info.investigator).to.equal(investigator2.address);
    });

    it("Should allow regulator to complete any investigation", async function () {
      const { foodSafety, owner, investigator1, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(owner).authorizeInvestigator(investigator1.address);
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report");
      await foodSafety.connect(investigator1).startInvestigation(1);

      // Regulator (owner) can complete any investigation
      await expect(
        foodSafety.connect(owner).completeInvestigation(1, 2, "Completed by regulator")
      ).to.emit(foodSafety, "InvestigationCompleted");
    });
  });

  describe("Batch Operations Extended", function () {
    it("Should handle empty batch update", async function () {
      const { foodSafety, owner } = await loadFixture(deployFoodSafetyFixture);

      await expect(
        foodSafety.connect(owner).batchUpdateStatus([], 1)
      ).to.not.be.reverted;
    });

    it("Should handle batch update with single report", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report");

      await foodSafety.connect(owner).batchUpdateStatus([1], 1);

      const reportInfo = await foodSafety.getReportInfo(1);
      expect(reportInfo.status).to.equal(1);
    });

    it("Should handle large batch update", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      // Create 10 reports
      for (let i = 0; i < 10; i++) {
        await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, `Report ${i + 1}`);
      }

      const reportIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      await foodSafety.connect(owner).batchUpdateStatus(reportIds, 1);

      // Verify all updated
      for (const id of reportIds) {
        const reportInfo = await foodSafety.getReportInfo(id);
        expect(reportInfo.status).to.equal(1);
      }
    });
  });

  describe("Location Statistics Extended", function () {
    it("Should return zero stats for location with no reports", async function () {
      const { foodSafety } = await loadFixture(deployFoodSafetyFixture);

      const locationStats = await foodSafety.getLocationStats(9999);
      expect(locationStats.totalReports).to.equal(0);
      expect(locationStats.resolvedReports).to.equal(0);
    });

    it("Should track multiple locations independently", async function () {
      const { foodSafety, reporter1, reporter2 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Location 1 Report 1");
      await foodSafety.connect(reporter1).submitAnonymousReport(3, 1001, 5002, "Location 1 Report 2");
      await foodSafety.connect(reporter2).submitAnonymousReport(2, 1002, 5003, "Location 2 Report 1");

      const loc1Stats = await foodSafety.getLocationStats(1001);
      const loc2Stats = await foodSafety.getLocationStats(1002);

      expect(loc1Stats.totalReports).to.equal(2);
      expect(loc2Stats.totalReports).to.equal(1);
    });
  });

  describe("Event Emissions", function () {
    it("Should emit ReportSubmitted with correct parameters", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      const tx = await foodSafety.connect(reporter1).submitAnonymousReport(
        2, 1001, 5001, "Test report"
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return foodSafety.interface.parseLog(log).name === "ReportSubmitted";
        } catch (e) {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should emit ReportStatusChanged when status updated", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report");

      await expect(foodSafety.connect(owner).updateReportStatus(1, 1))
        .to.emit(foodSafety, "ReportStatusChanged")
        .withArgs(1, 1);
    });

    it("Should emit multiple events in batch update", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, "Report 1");
      await foodSafety.connect(reporter1).submitAnonymousReport(2, 1002, 5002, "Report 2");

      const tx = await foodSafety.connect(owner).batchUpdateStatus([1, 2], 1);
      const receipt = await tx.wait();

      const statusChangedEvents = receipt.logs.filter(log => {
        try {
          return foodSafety.interface.parseLog(log).name === "ReportStatusChanged";
        } catch (e) {
          return false;
        }
      });

      expect(statusChangedEvents.length).to.equal(2);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for report submission", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      const tx = await foodSafety.connect(reporter1).submitAnonymousReport(
        2, 1001, 5001, "Test report"
      );
      const receipt = await tx.wait();

      // Gas should be under 500k for single report
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("Should be more efficient for batch operations", async function () {
      const { foodSafety, owner, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      // Create 3 reports
      for (let i = 0; i < 3; i++) {
        await foodSafety.connect(reporter1).submitAnonymousReport(2, 1001, 5001, `Report ${i + 1}`);
      }

      const tx = await foodSafety.connect(owner).batchUpdateStatus([1, 2, 3], 1);
      const receipt = await tx.wait();

      // Batch should be more efficient than 3 individual calls
      expect(receipt.gasUsed).to.be.lt(300000);
    });
  });

  describe("Query Functions", function () {
    it("Should return default values for non-existent report", async function () {
      const { foodSafety } = await loadFixture(deployFoodSafetyFixture);

      const reportInfo = await foodSafety.getReportInfo(999);
      expect(reportInfo.isValid).to.be.false;
      expect(reportInfo.timestamp).to.equal(0);
    });

    it("Should return zero for non-reporter stats", async function () {
      const { foodSafety, reporter1 } = await loadFixture(deployFoodSafetyFixture);

      const stats = await foodSafety.getReporterStats(reporter1.address);
      expect(stats).to.equal(0);
    });

    it("Should handle getTotalStats with no reports", async function () {
      const { foodSafety } = await loadFixture(deployFoodSafetyFixture);

      const stats = await foodSafety.getTotalStats();
      expect(stats.total).to.equal(0);
      expect(stats.submitted).to.equal(0);
      expect(stats.resolved).to.equal(0);
    });
  });
});
