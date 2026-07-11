import React, { useState } from 'react';

interface AccountInfoProps {
  address: `0x${string}` | undefined;
  balance?: string;
  chainId?: number;
  showBalance?: boolean;
  onDisconnect: () => void;
  onSwitchChain: (chainId: number) => void;
}

// Common networks for switching
const COMMON_NETWORKS = [
  { chainId: 1, name: 'Ethereum', color: 'from-blue-500 to-indigo-600' },
  { chainId: 11155111, name: 'Sepolia', color: 'from-yellow-400 to-yellow-600' },
  { chainId: 137, name: 'Polygon', color: 'from-purple-500 to-purple-700' },
  { chainId: 56, name: 'BNB Chain', color: 'from-yellow-500 to-orange-500' },
  { chainId: 43114, name: 'Avalanche', color: 'from-red-500 to-red-700' },
  { chainId: 42161, name: 'Arbitrum', color: 'from-blue-400 to-cyan-500' },
];

// Simple chain ID to name mapping
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  5: 'Goerli',
  11155111: 'Sepolia',
  137: 'Polygon',
  80001: 'Mumbai',
  56: 'BNB Chain',
  97: 'BNB Testnet',
  43114: 'Avalanche',
  43113: 'Fuji',
  250: 'Fantom',
  4002: 'Fantom Testnet',
  42161: 'Arbitrum',
  421613: 'Arbitrum Goerli',
};

const getChainName = (chainId?: number): string => {
  if (!chainId) return 'Unknown';
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};

const truncateAddress = (addr: string | undefined, len = 6): string => {
  if (!addr) return '';
  if (addr.length < len * 2) return addr;
  return `${addr.slice(0, len)}...${addr.slice(-4)}`;
};

const NetworkSwitchModal: React.FC<{
  isOpen: boolean;
  currentChainId?: number;
  onClose: () => void;
  onSwitch: (chainId: number) => void;
}> = ({ isOpen, currentChainId, onClose, onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async (chainId: number) => {
    setLoading(true);
    setError(null);
    try {
      onSwitch(chainId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch network');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">切换网络</h3>
        </div>
        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        <div className="p-4 space-y-2">
          {COMMON_NETWORKS.map((net) => (
            <button
              key={net.chainId}
              onClick={() => handleSwitch(net.chainId)}
              disabled={loading || net.chainId === currentChainId}
              className={`
                w-full px-4 py-3 rounded-xl font-medium transition-all text-left flex items-center gap-3
                ${net.chainId === currentChainId
                  ? `bg-gradient-to-r ${net.color} text-white shadow-md`
                  : loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                }
              `}
            >
              <span>{net.name}</span>
              {net.chainId === currentChainId && (
                <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountModal: React.FC<{
  isOpen: boolean;
  address: string | undefined;
  balance?: string;
  chainName: string;
  onClose: () => void;
  onDisconnect: () => void;
}> = ({ isOpen, address, balance, chainName, onClose, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    onDisconnect();
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">账户信息</h3>
          <p className="text-sm text-gray-500 mt-1">{chainName}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Balance */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">余额</p>
            <p className="text-2xl font-bold text-gray-800">{balance || '0'} ETH</p>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">地址</p>
            <p className="text-sm font-mono text-gray-700 break-all">{address}</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className={`
                w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                ${copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }
              `}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  复制地址
                </>
              )}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              断开连接
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export const AccountInfo: React.FC<AccountInfoProps> = ({
  address,
  balance,
  chainId,
  showBalance,
  onDisconnect,
  onSwitchChain,
}) => {
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  if (!address) return null;

  const chainName = getChainName(chainId);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Network Button - clickable to switch */}
        <button
          onClick={() => setShowNetworkModal(true)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl font-medium text-gray-700 transition-all hover:shadow-md flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {chainName}
        </button>

        {/* Account Button */}
        <button
          onClick={() => setShowAccountModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-3"
        >
          <span className="font-mono">{truncateAddress(address)}</span>
          {showBalance && balance && (
            <span className="border-l border-white/30 pl-3 text-sm opacity-90">
              {balance} ETH
            </span>
          )}
        </button>
      </div>

      <NetworkSwitchModal
        isOpen={showNetworkModal}
        currentChainId={chainId}
        onClose={() => setShowNetworkModal(false)}
        onSwitch={onSwitchChain}
      />
      <AccountModal
        isOpen={showAccountModal}
        address={address}
        balance={balance}
        chainName={chainName}
        onClose={() => setShowAccountModal(false)}
        onDisconnect={onDisconnect}
      />
    </>
  );
};

export default AccountInfo;