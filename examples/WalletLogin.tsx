'use client';
import { useState } from 'react';
import { useWallet } from '@wkrjwlt/walletkit';
import { walletLogin, verifyJWT } from '@wkrjwlt/walletkit';

/**
 * 钱包登录组件
 * 使用签名验证实现安全的钱包登录
 */
export default function WalletLogin() {
  const { signMessage, isConnected, address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  /**
   * 处理钱包登录
   */
  const handleLogin = async () => {
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 执行钱包登录流程
      const jwtToken = await walletLogin(
        {
          signMessage: async (message: string) => {
            return await signMessage(message);
          },
          getProvider: () => {
            // 获取钱包提供者
            if (typeof window !== 'undefined') {
              return (window as any).ethereum;
            }
            return null;
          },
        },
        'MetaNode Stake Demo'
      );

      setToken(jwtToken);

      // 保存到 localStorage
      localStorage.setItem('auth_token', jwtToken);

      console.log('登录成功！', {
        token: jwtToken,
        payload: verifyJWT(jwtToken),
      });

      alert('登录成功！');
    } catch (error: any) {
      console.error('登录失败:', error);
      setError(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 登出
   */
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
    alert('已登出');
  };

  /**
   * 检查是否已登录
   */
  const checkAuth = () => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      const payload = verifyJWT(savedToken);
      if (payload) {
        setToken(savedToken);
        return true;
      } else {
        localStorage.removeItem('auth_token');
        return false;
      }
    }
    return false;
  };

  // 组件挂载时检查登录状态
  useState(() => {
    checkAuth();
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
      <h2 className="text-2xl font-bold mb-4">钱包登录</h2>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 未登录状态 */}
      {!token ? (
        <div>
          <p className="text-gray-600 mb-4">
            使用您的钱包签名来验证身份，无需密码即可登录。
          </p>

          {isConnected ? (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed font-medium"
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
                  登录中...
                </span>
              ) : (
                '🔗 使用钱包登录'
              )}
            </button>
          ) : (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                请先连接钱包
              </p>
            </div>
          )}
        </div>
      ) : (
        /* 已登录状态 */
        <div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-semibold">已登录</span>
            </div>

            {address && (
              <p className="text-xs text-gray-600">
                钱包地址: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Token: {token.slice(0, 20)}...
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            登出
          </button>
        </div>
      )}

      {/* 说明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-gray-600">
        <p className="font-medium mb-1">💡 工作原理:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>生成随机 nonce</li>
          <li>钱包签名包含 nonce 的消息</li>
          <li>验证签名有效性</li>
          <li>生成 JWT Token 用于认证</li>
        </ol>
      </div>
    </div>
  );
}