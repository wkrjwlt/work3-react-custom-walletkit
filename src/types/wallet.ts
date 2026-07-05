export type WalletId = 'metamask' | 'walletconnect' | string;

export interface WalletInfo {
  id: WalletId;
  name: string;
  icon?: string;
  ready?: boolean;
}

export interface ConnectedWallet {
  id: WalletId;
  address: string;
  chainId?: number;
  balance?: string; // balance in wei as string
}
