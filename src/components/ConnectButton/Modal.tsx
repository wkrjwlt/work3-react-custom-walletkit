import React from 'react';
import WalletItem from './WalletItem';

export const Modal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div style={{ width: 420, margin: '80px auto', background: '#fff', padding: 16 }} onClick={e => e.stopPropagation()}>
        <h3>Select Wallet</h3>
        <WalletItem id="metamask" name="MetaMask" />
        <WalletItem id="walletconnect" name="WalletConnect" />
      </div>
    </div>
  );
};

export default Modal;
