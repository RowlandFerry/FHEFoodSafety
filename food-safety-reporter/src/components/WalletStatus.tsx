import React from 'react';
import { useContractContext } from '../context/ContractContext';
import { CONTRACT_ADDRESS } from '../utils/constants';

export function WalletStatus() {
  const { isConnected, userAddress, connectWallet, error } = useContractContext();

  return (
    <div className="card">
      <div className="grid">
        <div>
          <h3>🔗 Wallet Status</h3>
          {isConnected && userAddress ? (
            <p>
              ✅ Connected
              <br />
              <small>
                {userAddress.substring(0, 10)}...{userAddress.substring(userAddress.length - 8)}
              </small>
            </p>
          ) : (
            <p>Not Connected</p>
          )}
          <button className="btn btn-secondary" onClick={connectWallet} disabled={isConnected}>
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
          {error && <div className="error-message" style={{ marginTop: '10px' }}>{error}</div>}
        </div>
        <div>
          <h3>🔧 Contract Status</h3>
          {isConnected ? (
            <p>
              ✅ Connected
              <br />
              <small>{CONTRACT_ADDRESS.substring(0, 10)}...</small>
            </p>
          ) : (
            <p>Not Connected</p>
          )}
        </div>
      </div>
    </div>
  );
}
