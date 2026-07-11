import { createRoot } from 'react-dom/client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { WalletProvider } from '../src/provider/WalletProvider';
import type { WalletKitConfig } from '../src/types/wallet';
import ConnectButton from '../src/components/ConnectButton';
import './index.css';

// WalletConnect Project ID - 请替换为你自己的 Project ID
// 获取地址: https://cloud.walletconnect.com/
const projectId = '0029f9c8592dd69181c6ee9806187bb4';

// 自定义钱包配置示例
// 注意：只能修改现有钱包的显示属性，不能添加新的钱包
const walletConfig: WalletKitConfig = {
  appName: 'WalletKit Demo',

  // 自定义钱包列表（可以修改默认钱包的显示属性）
  wallets: [
    // 示例：修改 MetaMask 的显示名称和描述
    {
      id: 'metamask',
      name: 'MetaMask', // 可以修改显示名称
      description: '最流行的以太坊钱包，支持浏览器扩展和移动端。', // 可以修改描述
      loadingText: '正在连接 MetaMask...', // 可以修改加载提示
    },

    // 示例：禁用某个钱包（设置 enabled: false）
    // {
    //   id: 'coinbase',
    //   enabled: false, // 设置为 false 则不会显示
    // },
  ],

  // 自定义主题配置（可选）
  theme: {
    primaryColor: '#3B82F6',
    borderRadius: '12px',
  },
};

// Wagmi 配置 - 使用支持 CORS 的公共 RPC 端点
// injected() 会自动检测所有注入的钱包（包括 MetaMask）
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // 自动检测注入的钱包（MetaMask 等）
    walletConnect({ projectId }), // WalletConnect
    coinbaseWallet({ appName: 'WalletKit Demo' }), // Coinbase Wallet
  ],
  transports: {
    [mainnet.id]: http('https://ethereum.publicnode.com'),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 使用自定义钱包配置 */}
        <WalletProvider config={walletConfig}>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  React Wallet Kit Demo
                </h1>
                <p className="text-gray-300 mb-8">
                  一个简洁的 React 钱包连接组件，支持自定义钱包配置、MetaMask、Coinbase Wallet 和 WalletConnect
                </p>

                {/* 使用说明 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 text-left">
                  <h2 className="text-xl font-semibold text-white mb-3">钱包配置说明</h2>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p>✅ 支持修改钱包的显示名称、描述、图标</p>
                    <p>✅ 支持禁用不需要的钱包</p>
                    <p>✅ 内置真实钱包图标（MetaMask、Coinbase、WalletConnect）</p>
                    <p className="mt-3 text-gray-400">
                      查看 <code className="bg-black/30 px-1 rounded">demo/index.tsx</code> 了解配置方式
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ConnectButton showBalance />
                </div>
              </div>
            </div>
          </div>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);