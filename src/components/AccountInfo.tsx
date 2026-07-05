import React, { useState } from 'react';
import type { ConnectedWallet } from '../types/wallet';
import useWallet from '../provider/useWallet';

// Simple chain ID to name mapping
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon',
  80001: 'Polygon Mumbai',
  56: 'BNB Chain',
  97: 'BNB Testnet',
  43114: 'Avalanche C-Chain',
  43113: 'Avalanche Fuji',
  250: 'Fantom',
  4002: 'Fantom Testnet',
  42161: 'Arbitrum One',
  421613: 'Arbitrum Goerli',
};

// Common networks for switching
const COMMON_NETWORKS = [
  { chainId: 1, name: 'Ethereum Mainnet' },
  { chainId: 11155111, name: 'Sepolia Testnet' },
  { chainId: 137, name: 'Polygon' },
  { chainId: 56, name: 'BNB Chain' },
  { chainId: 43114, name: 'Avalanche C-Chain' },
  { chainId: 42161, name: 'Arbitrum One' },
];

const getChainName = (chainId?: number): string => {
  if (!chainId) return 'Unknown Network';
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};

const truncateAddress = (addr: string, len = 6): string => {
  if (!addr || addr.length < len * 2) return addr;
  return `${addr.slice(0, len)}...${addr.slice(-len)}`;
};

const formatBalance = (balanceWei?: string): string => {
  if (!balanceWei) return '0';
  try {
    const balance = BigInt(balanceWei);
    const eth = balance / BigInt(10 ** 18);
    const remainder = balance % BigInt(10 ** 18);
    const decimals = remainder.toString().padStart(18, '0').slice(0, 4);
    return `${eth}.${decimals}`;
  } catch (e) {
    return '0';
  }
};

const NetworkSwitchModal: React.FC<{
  isOpen: boolean;
  currentChainId?: number;
  onClose: () => void;
  onSwitch: (chainId: number) => Promise<void>;
}> = ({ isOpen, currentChainId, onClose, onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async (chainId: number) => {
    setLoading(true);
    setError(null);
    try {
      await onSwitch(chainId);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 300,
          background: '#fff',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Switch Network</h3>
        {error && <div style={{ color: 'red', fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <div>
          {COMMON_NETWORKS.map((net) => (
            <button
              key={net.chainId}
              onClick={() => handleSwitch(net.chainId)}
              disabled={loading || net.chainId === currentChainId}
              style={{
                width: '100%',
                padding: 10,
                marginBottom: 8,
                background: net.chainId === currentChainId ? '#e0e0e0' : '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: 4,
                cursor: net.chainId === currentChainId ? 'default' : 'pointer',
                fontWeight: net.chainId === currentChainId ? 600 : 400,
              }}
            >
              {net.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 10,
            background: '#ddd',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const AccountModal: React.FC<{
  isOpen: boolean;
  address: string;
  balance?: string;
  showBalance?: boolean;
  onClose: () => void;
  onDisconnect: () => Promise<void>;
}> = ({ isOpen, address, balance, showBalance, onClose, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await onDisconnect();
    setLoading(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 300,
          background: '#fff',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Account</h3>
        {showBalance && (
          <div
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 4,
              marginBottom: 12,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Balance: {formatBalance(balance)} ETH
          </div>
        )}
        <div
          style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            marginBottom: 12,
            wordBreak: 'break-all',
            fontSize: 12,
            fontFamily: 'monospace',
          }}
        >
          {address}
        </div>
        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 8,
            background: copied ? '#4caf50' : '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {copied ? '✓ Copied' : 'Copy Address'}
        </button>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 8,
            background: '#ff5252',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Disconnect
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 10,
            background: '#ddd',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const AccountInfo: React.FC<{ wallet?: ConnectedWallet | null; showBalance?: boolean }> = ({
  wallet,
  showBalance,
}) => {
  const { disconnect, switchNetwork } = useWallet();
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  if (!wallet) return null;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setShowNetworkModal(true)}
          style={{
            padding: '8px 12px',
            fontSize: 14,
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {getChainName(wallet.chainId)}
        </button>
        <button
          onClick={() => setShowAccountModal(true)}
          style={{
            padding: '8px 12px',
            fontSize: 14,
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {truncateAddress(wallet.address)}
        </button>
        {showBalance && (
          <div
            style={{
              padding: '8px 12px',
              fontSize: 14,
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontWeight: 500,
            }}
          >
            {formatBalance(wallet.balance)} ETH
          </div>
        )}
      </div>
      <NetworkSwitchModal
        isOpen={showNetworkModal}
        currentChainId={wallet.chainId}
        onClose={() => setShowNetworkModal(false)}
        onSwitch={switchNetwork}
      />
      <AccountModal
        isOpen={showAccountModal}
        address={wallet.address}
        balance={wallet.balance}
        showBalance={showBalance}
        onClose={() => setShowAccountModal(false)}
        onDisconnect={disconnect}
      />
    </>
  );
};

export default AccountInfo;
