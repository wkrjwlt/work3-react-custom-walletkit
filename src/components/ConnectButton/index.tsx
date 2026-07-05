import React, { useState } from 'react';
import Modal from './Modal';
import AccountInfo from '../AccountInfo';
import useWallet from '../../provider/useWallet';

export interface ConnectButtonProps {
  showBalance?: boolean;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({ showBalance = false }) => {
  const [open, setOpen] = useState(false);
  const { wallet } = useWallet();

  if (wallet) {
    return <AccountInfo wallet={wallet} showBalance={showBalance} />;
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>Connect Wallet</button>
      <Modal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ConnectButton;
