import React, { createContext, useContext, ReactNode } from 'react';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

interface ContractContextType {
  contract: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  userAddress: string | null;
  isConnected: boolean;
  error: string | null;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const contractData = useContract();

  return (
    <ContractContext.Provider value={contractData}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContractContext() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  return context;
}
