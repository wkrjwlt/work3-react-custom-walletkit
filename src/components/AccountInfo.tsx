import React from 'react';
import type { ConnectedWallet } from '../types/wallet';

export const AccountInfo: React.FC<{ wallet?: ConnectedWallet | null }> = ({ wallet }) => {
  if (!wallet) return null;
  return (
    <div>
      <div>Address: {wallet.address}</div>
      <div>Chain: {wallet.chainId ?? 'unknown'}</div>
    </div>
  );
};

export default AccountInfo;
