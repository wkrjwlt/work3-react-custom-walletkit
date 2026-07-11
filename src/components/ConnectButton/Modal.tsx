import React, { useEffect, useState } from 'react';
import WalletItem from './WalletItem';
import { useWallet } from '../../provider/WalletProvider';

export const Modal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { connect, isConnecting, isConnected, walletActions } = useWallet();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 连接成功后关闭弹窗
  useEffect(() => {
    if (isConnected && open) {
      onClose();
    }
  }, [isConnected, open, onClose]);

  // 弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setError(null);
    }
  }, [open]);

  const handleSelect = async (walletId: string) => {
    setSelectedId(walletId);
    setError(null);

    try {
      await connect(walletId);
    } catch (err: any) {
      const message = err?.message || String(err);
      if (message.includes('User rejected') || message.includes('User canceled')) {
        // 用户取消，不做任何处理
        setSelectedId(null);
      } else {
        setError(message);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左侧钱包列表 */}
        <div className="w-72 border-r border-gray-100 p-6 flex flex-col bg-gradient-to-b from-slate-50 to-white">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">选择钱包</h3>
            <p className="mt-2 text-sm text-gray-500">
              请选择一个钱包进行连接
            </p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {walletActions.map((walletAction) => (
              <WalletItem
                key={walletAction.id}
                id={walletAction.id}
                name={walletAction.name}
                icon={walletAction.icon}
                onClick={handleSelect}
                disabled={isConnecting && selectedId !== walletAction.id}
                selected={selectedId === walletAction.id}
              />
            ))}
          </div>
        </div>

        {/* 右侧详情 */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedId ? walletActions.find(w => w.id === selectedId)?.name : '什么是钱包？'}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-md">
                {selectedId
                  ? walletActions.find(w => w.id === selectedId)?.description
                  : '钱包是用于管理你的私钥、签名交易和连接去中心化应用的安全工具。请选择一种钱包来继续。'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center mt-8">
            {!selectedId && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-gray-500 max-w-sm">从左侧选择一个钱包，查看它的连接方式与当前状态。</p>
              </div>
            )}

            {selectedId && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-4 shadow-lg">
                  <img
                    src={walletActions.find(w => w.id === selectedId)?.icon}
                    alt={walletActions.find(w => w.id === selectedId)?.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {walletActions.find(w => w.id === selectedId)?.name}
                </h4>

                {isConnecting && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{walletActions.find(w => w.id === selectedId)?.loadingText}</span>
                  </div>
                )}

                {error && (
                  <div className="mt-6 w-full max-w-sm">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                      {error}
                    </div>
                    <button
                      onClick={() => { setError(null); handleSelect(selectedId); }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      重新连接
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;