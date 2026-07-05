import React, { useState, useCallback } from 'react';
import { WalletContext } from './context';
import type { ConnectedWallet } from '../types/wallet';

export const WalletProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);

  const connect = useCallback(async (id: string) => {
    // placeholder: integrate adapters here
    setWallet({ id, address: '0x0000000000000000000000000000000000000000' });
  }, []);

  const disconnect = useCallback(async () => {
    setWallet(null);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
