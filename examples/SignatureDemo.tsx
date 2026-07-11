'use client';
import { useState } from 'react';
import { useWallet } from '@wkrjwlt/walletkit';

/**
 * 签名演示组件
 * 展示如何使用钱包签名功能
 */
export default function SignatureDemo() {
  const { signMessage, isConnected, address, status } = useWallet();
  const [signature, setSignature] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * 签名普通消息
   */
  const handleSignMessage = async () => {
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const message = 'Hello, MetaNode Stake Demo!';
      const sig = await signMessage(message);
      setSignature(sig);
      console.log('签名成功:', { message, signature: sig });
    } catch (err: any) {
      console.error('签名失败:', err);
      setError(err.message || '签名失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 签名自定义消息
   */
  const handleSignCustom = async (customMessage: string) => {
    if (!isConnected || !customMessage.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sig = await signMessage(customMessage);
      setSignature(sig);
      console.log('签名成功:', { message: customMessage, signature: sig });
    } catch (err: any) {
      console.error('签名失败:', err);
      setError(err.message || '签名失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">签名功能演示</h2>

      {/* 钱包状态 */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm">
          <span className="font-medium">状态:</span>{' '}
          <span
            className={
              status === 'connected'
                ? 'text-green-600'
                : status === 'connecting'
                ? 'text-yellow-600'
                : 'text-gray-600'
            }
          >
            {status === 'connected'
              ? '已连接'
              : status === 'connecting'
              ? '连接中...'
              : '未连接'}
          </span>
        </p>
        {address && (
          <p className="text-sm mt-1">
            <span className="font-medium">地址:</span>{' '}
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 签名按钮 */}
      <div className="space-y-3">
        <button
          onClick={handleSignMessage}
          disabled={!isConnected || loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              签名中...
            </span>
          ) : (
            '签名消息: "Hello, MetaNode Stake Demo!"'
          )}
        </button>

        {/* 自定义消息签名 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入自定义消息..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSignCustom(e.currentTarget.value);
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              handleSignCustom(input.value);
            }}
            disabled={!isConnected || loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            签名
          </button>
        </div>
      </div>

      {/* 签名结果 */}
      {signature && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">签名结果:</h3>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Signature:</p>
            <p className="text-sm font-mono break-all text-green-700">
              {signature}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(signature);
                alert('签名已复制到剪贴板');
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              📋 复制签名
            </button>
          </div>
        </div>
      )}
    </div>
  );
}