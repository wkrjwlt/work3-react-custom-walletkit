import React from 'react';
import WalletItem from './WalletItem';
import metamaskLogo from '../../assets/metamask.svg';
import walletconnectLogo from '../../assets/walletconnect.svg';
import coinbaseLogo from '../../assets/coinbase.svg';
import useWallet from '../../provider/useWallet';

export const Modal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { connect } = useWallet();

  if (!open) return null;

  const handleSelect = async (id: string) => {
    try {
      await connect(id);
    } catch (e) {
      // swallow for now; provider handles errors
      // console.error(e);
    } finally {
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div style={{ width: 420, margin: '80px auto', background: '#fff', padding: 16 }} onClick={e => e.stopPropagation()}>
        <h3>Select Wallet</h3>
        <WalletItem id="metamask" name="MetaMask" icon={metamaskLogo} onClick={handleSelect} />
        <WalletItem id="coinbase" name="Coinbase" icon={coinbaseLogo} onClick={handleSelect} />
        <WalletItem id="walletconnect" name="WalletConnect" icon={walletconnectLogo} onClick={handleSelect} />
      </div>
    </div>
  );
};

export default Modal;
