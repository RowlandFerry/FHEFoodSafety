// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool, eaddress } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousFoodSafety is SepoliaConfig {

    address public owner;
    address public regulator;
    uint32 public totalReports;

    enum ReportStatus {
        Submitted,      // 已提交
        UnderReview,    // 审查中
        Investigating,  // 调查中
        Resolved,       // 已解决
        Closed          // 已关闭
    }

    enum SafetyLevel {
        Unknown,        // 未知
        Safe,          // 安全
        Warning,       // 警告
        Danger,        // 危险
        Critical       // 严重
    }

    struct Report {
        euint32 encryptedReportId;      // 加密举报ID
        eaddress encryptedReporter;     // 加密举报者地址
        euint8 encryptedSafetyLevel;    // 加密安全等级
        euint32 encryptedLocation;      // 加密地点代码
        euint32 encryptedFoodType;      // 加密食品类型
        string encryptedDescription;    // 加密描述信息
        bool isProcessed;               // 是否已处理
        ReportStatus status;            // 举报状态
        uint256 timestamp;              // 举报时间
        uint256 lastUpdated;            // 最后更新时间
        bool isValid;                   // 举报是否有效
    }

    struct Investigation {
        uint32 reportId;
        address investigator;
        SafetyLevel finalSafetyLevel;
        string findings;
        bool isComplete;
        uint256 startTime;
        uint256 endTime;
    }

    struct LocationStats {
        uint32 totalReports;
        uint32 resolvedReports;
        SafetyLevel avgSafetyLevel;
        uint256 lastReportTime;
    }

    mapping(uint32 => Report) public reports;
    mapping(uint32 => Investigation) public investigations;
    mapping(uint32 => LocationStats) public locationStats;
    mapping(address => uint32[]) public reporterHistory; // 举报者历史记录
    mapping(address => bool) public authorizedInvestigators; // 授权调查员

    event ReportSubmitted(uint32 indexed reportId, uint256 timestamp);
    event ReportStatusChanged(uint32 indexed reportId, ReportStatus newStatus);
    event InvestigationStarted(uint32 indexed reportId, address indexed investigator);
    event InvestigationCompleted(uint32 indexed reportId, SafetyLevel finalLevel);
    event InvestigatorAuthorized(address indexed investigator);
    event InvestigatorRevoked(address indexed investigator);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyRegulator() {
        require(msg.sender == regulator || msg.sender == owner, "Not regulator");
        _;
    }

    modifier onlyInvestigator() {
        require(authorizedInvestigators[msg.sender] || msg.sender == regulator || msg.sender == owner, "Not authorized investigator");
        _;
    }

    constructor() {
        owner = msg.sender;
        regulator = msg.sender;
        totalReports = 0;
    }

    // 设置监管机构
    function setRegulator(address _regulator) external onlyOwner {
        regulator = _regulator;
    }

    // 授权调查员
    function authorizeInvestigator(address _investigator) external onlyRegulator {
        authorizedInvestigators[_investigator] = true;
        emit InvestigatorAuthorized(_investigator);
    }

    // 撤销调查员权限
    function revokeInvestigator(address _investigator) external onlyRegulator {
        authorizedInvestigators[_investigator] = false;
        emit InvestigatorRevoked(_investigator);
    }

    // 提交匿名食品安全举报
    function submitAnonymousReport(
        uint8 _safetyLevel,      // 安全等级 (0-4)
        uint32 _locationCode,    // 地点代码
        uint32 _foodTypeCode,    // 食品类型代码
        string memory _description // 问题描述
    ) external {
        require(_safetyLevel <= 4, "Invalid safety level");

        totalReports++;
        uint32 reportId = totalReports;

        // 加密敏感信息
        euint32 encryptedReportId = FHE.asEuint32(reportId);
        eaddress encryptedReporter = FHE.asEaddress(msg.sender);
        euint8 encryptedSafetyLevel = FHE.asEuint8(_safetyLevel);
        euint32 encryptedLocation = FHE.asEuint32(_locationCode);
        euint32 encryptedFoodType = FHE.asEuint32(_foodTypeCode);

        reports[reportId] = Report({
            encryptedReportId: encryptedReportId,
            encryptedReporter: encryptedReporter,
            encryptedSafetyLevel: encryptedSafetyLevel,
            encryptedLocation: encryptedLocation,
            encryptedFoodType: encryptedFoodType,
            encryptedDescription: _description,
            isProcessed: false,
            status: ReportStatus.Submitted,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            isValid: true
        });

        // 更新举报者历史
        reporterHistory[msg.sender].push(reportId);

        // 更新地点统计
        locationStats[_locationCode].totalReports++;
        locationStats[_locationCode].lastReportTime = block.timestamp;

        // 设置访问权限
        FHE.allowThis(encryptedReportId);
        FHE.allowThis(encryptedReporter);
        FHE.allowThis(encryptedSafetyLevel);
        FHE.allowThis(encryptedLocation);
        FHE.allowThis(encryptedFoodType);

        // 允许监管机构访问
        FHE.allow(encryptedReportId, regulator);
        FHE.allow(encryptedReporter, regulator);
        FHE.allow(encryptedSafetyLevel, regulator);
        FHE.allow(encryptedLocation, regulator);
        FHE.allow(encryptedFoodType, regulator);

        emit ReportSubmitted(reportId, block.timestamp);
    }

    // 更新举报状态（仅监管机构）
    function updateReportStatus(uint32 _reportId, ReportStatus _status) external onlyRegulator {
        require(reports[_reportId].isValid, "Invalid report");

        reports[_reportId].status = _status;
        reports[_reportId].lastUpdated = block.timestamp;

        emit ReportStatusChanged(_reportId, _status);
    }

    // 开始调查
    function startInvestigation(uint32 _reportId) external onlyInvestigator {
        require(reports[_reportId].isValid, "Invalid report");
        require(reports[_reportId].status == ReportStatus.Submitted || reports[_reportId].status == ReportStatus.UnderReview, "Cannot investigate");

        investigations[_reportId] = Investigation({
            reportId: _reportId,
            investigator: msg.sender,
            finalSafetyLevel: SafetyLevel.Unknown,
            findings: "",
            isComplete: false,
            startTime: block.timestamp,
            endTime: 0
        });

        // 更新举报状态
        reports[_reportId].status = ReportStatus.Investigating;
        reports[_reportId].lastUpdated = block.timestamp;

        emit InvestigationStarted(_reportId, msg.sender);
    }

    // 完成调查
    function completeInvestigation(
        uint32 _reportId,
        SafetyLevel _finalLevel,
        string memory _findings
    ) external onlyInvestigator {
        require(investigations[_reportId].investigator == msg.sender || msg.sender == regulator, "Not assigned investigator");
        require(!investigations[_reportId].isComplete, "Investigation already complete");

        investigations[_reportId].finalSafetyLevel = _finalLevel;
        investigations[_reportId].findings = _findings;
        investigations[_reportId].isComplete = true;
        investigations[_reportId].endTime = block.timestamp;

        // 更新举报状态
        reports[_reportId].status = ReportStatus.Resolved;
        reports[_reportId].lastUpdated = block.timestamp;
        reports[_reportId].isProcessed = true;

        // 更新地点统计
        uint32 locationCode;
        // 这里需要解密位置信息来更新统计，实际实现中需要异步处理

        emit InvestigationCompleted(_reportId, _finalLevel);
    }

    // 获取举报基本信息（不泄露敏感信息）
    function getReportInfo(uint32 _reportId) external view returns (
        ReportStatus status,
        uint256 timestamp,
        uint256 lastUpdated,
        bool isProcessed,
        bool isValid
    ) {
        Report storage report = reports[_reportId];
        return (
            report.status,
            report.timestamp,
            report.lastUpdated,
            report.isProcessed,
            report.isValid
        );
    }

    // 获取调查信息
    function getInvestigationInfo(uint32 _reportId) external view returns (
        address investigator,
        SafetyLevel finalSafetyLevel,
        string memory findings,
        bool isComplete,
        uint256 startTime,
        uint256 endTime
    ) {
        Investigation storage investigation = investigations[_reportId];
        return (
            investigation.investigator,
            investigation.finalSafetyLevel,
            investigation.findings,
            investigation.isComplete,
            investigation.startTime,
            investigation.endTime
        );
    }

    // 获取地点统计（公开信息）
    function getLocationStats(uint32 _locationCode) external view returns (
        uint32 totalReports,
        uint32 resolvedReports,
        SafetyLevel avgSafetyLevel,
        uint256 lastReportTime
    ) {
        LocationStats storage stats = locationStats[_locationCode];
        return (
            stats.totalReports,
            stats.resolvedReports,
            stats.avgSafetyLevel,
            stats.lastReportTime
        );
    }

    // 获取举报者的举报数量（不泄露具体举报）
    function getReporterStats(address _reporter) external view returns (uint32 reportCount) {
        return uint32(reporterHistory[_reporter].length);
    }

    // 获取总体统计
    function getTotalStats() external view returns (
        uint32 total,
        uint32 submitted,
        uint32 underReview,
        uint32 investigating,
        uint32 resolved,
        uint32 closed
    ) {
        total = totalReports;

        // 遍历所有举报统计各状态数量
        for (uint32 i = 1; i <= totalReports; i++) {
            if (reports[i].isValid) {
                if (reports[i].status == ReportStatus.Submitted) submitted++;
                else if (reports[i].status == ReportStatus.UnderReview) underReview++;
                else if (reports[i].status == ReportStatus.Investigating) investigating++;
                else if (reports[i].status == ReportStatus.Resolved) resolved++;
                else if (reports[i].status == ReportStatus.Closed) closed++;
            }
        }
    }

    // 批量处理举报（仅监管机构）
    function batchUpdateStatus(uint32[] memory _reportIds, ReportStatus _status) external onlyRegulator {
        for (uint i = 0; i < _reportIds.length; i++) {
            if (reports[_reportIds[i]].isValid) {
                reports[_reportIds[i]].status = _status;
                reports[_reportIds[i]].lastUpdated = block.timestamp;
                emit ReportStatusChanged(_reportIds[i], _status);
            }
        }
    }

    // 紧急关闭举报（异常情况）
    function emergencyCloseReport(uint32 _reportId, string memory _reason) external onlyOwner {
        require(reports[_reportId].isValid, "Invalid report");

        reports[_reportId].status = ReportStatus.Closed;
        reports[_reportId].lastUpdated = block.timestamp;
        reports[_reportId].isValid = false;

        emit ReportStatusChanged(_reportId, ReportStatus.Closed);
    }
}