import React, { useState } from 'react';
import { ContractProvider } from './context/ContractContext';
import { SubmitReportTab } from './components/SubmitReportTab';
import { QueryReportTab } from './components/QueryReportTab';
import { StatsTab } from './components/StatsTab';
import { ManageTab } from './components/ManageTab';
import { WalletStatus } from './components/WalletStatus';
import './App.css';

type TabType = 'submit' | 'query' | 'stats' | 'manage';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('submit');

  return (
    <ContractProvider>
      <div className="container">
        <div className="header">
          <h1>🛡️ Anonymous Food Safety Reporting System</h1>
          <p>Protecting Privacy, Safeguarding Food Safety - Powered by Homomorphic Encryption</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            Submit Report
          </button>
          <button
            className={`tab ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            Query Report
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button
            className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Management
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'submit' && <SubmitReportTab />}
          {activeTab === 'query' && <QueryReportTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'manage' && <ManageTab />}
        </div>

        <WalletStatus />
      </div>
    </ContractProvider>
  );
}

export default App;
