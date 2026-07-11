import React, { useState } from 'react';
import Modal from './Modal';
import AccountInfo from '../AccountInfo';
import { useWallet } from '../../provider/WalletProvider';

export interface ConnectButtonProps {
  showBalance?: boolean;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({ showBalance = false }) => {
  const [open, setOpen] = useState(false);
  const { address, isConnected, balance, chainId, disconnect, switchChain } = useWallet();

  if (isConnected && address) {
    return (
      <AccountInfo
        address={address}
        balance={balance}
        chainId={chainId}
        showBalance={showBalance}
        onDisconnect={disconnect}
        onSwitchChain={switchChain}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        Connect Wallet
      </button>
      <Modal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ConnectButton;