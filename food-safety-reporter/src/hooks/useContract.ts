import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const browserSigner = await browserProvider.getSigner();
      const address = await browserSigner.getAddress();

      setProvider(browserProvider);
      setSigner(browserSigner);
      setUserAddress(address);
      setIsConnected(true);
      setError(null);

      // Initialize contract
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, browserSigner);
      setContract(contractInstance);

      return address;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      throw err;
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setUserAddress(null);
    setIsConnected(false);
    setContract(null);
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Auto-connect if previously connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.error('Auto-connect failed:', err);
        }
      };
      checkConnection();

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return {
    contract,
    provider,
    signer,
    userAddress,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
  };
}
