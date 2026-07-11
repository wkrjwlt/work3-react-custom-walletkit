import React from 'react';
import type { ConnectedWallet } from '../types/wallet';

export interface WalletContextState {
  wallet?: ConnectedWallet | null;
  connect: (id: string, options?: { onUri?: (uri: string) => void }) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}

export const WalletContext = React.createContext<WalletContextState | undefined>(undefined);
