# @wkrjwlt/walletkit

一个简洁的 React Web3 钱包连接组件，支持 MetaMask、Coinbase Wallet 和 WalletConnect，并内置真实钱包图标。

## 特性

- 🚀 开箱即用的 React 组件
- 🔌 支持多种钱包：MetaMask、Coinbase Wallet、WalletConnect
- 🎨 现代化 UI 设计（支持 TailwindCSS）
- 📱 响应式设计
- 🔧 完全类型支持（TypeScript）
- 🎯 **内置真实钱包图标**（MetaMask、Coinbase、WalletConnect）
- ⚙️ 支持修改钱包显示属性（名称、描述、图标等）
- ✅ 支持启用/禁用钱包
- 🔐 **安全登录** - 支持 nonce 签名验证和 JWT 生成
- 🔄 **链切换** - 支持多链切换
- ✍️ **消息签名** - 支持 signMessage 和 signTypedData
- 📊 **状态管理** - 完整的钱包状态和错误处理
- 🌐 **框架集成** - 支持 Next.js、React、Vite 等框架

## 安装

```bash
npm install @wkrjwlt/walletkit
# 或
yarn add @wkrjwlt/walletkit
# 或
pnpm add @wkrjwlt/walletkit
```

## 依赖

确保你的项目已安装以下 peer dependencies：

```bash
npm install react react-dom
```

## 使用

### 基本使用

```tsx
import { WalletProvider, ConnectButton } from '@wkrjwlt/walletkit';

function App() {
  return (
    <WalletProvider>
      <ConnectButton showBalance />
    </WalletProvider>
  );
}
```

### 自定义钱包显示属性

可以修改现有钱包的显示属性（名称、描述等）：

```tsx
import { WalletProvider, ConnectButton } from '@wkrjwlt/walletkit';
import type { WalletKitConfig } from '@wkrjwlt/walletkit';

function App() {
  const config: WalletKitConfig = {
    appName: 'My DApp',

    // 自定义钱包显示属性
    wallets: [
      // 修改 MetaMask 的显示名称和描述
      {
        id: 'metamask',
        name: 'MetaMask Pro',
        description: '我的自定义描述',
      },

      // 禁用某个钱包
      {
        id: 'coinbase',
        enabled: false,
      },
    ],
  };

  return (
    <WalletProvider config={config}>
      <ConnectButton showBalance />
    </WalletProvider>
  );
}
```

更多配置选项请查看 [钱包配置文档](docs/custom-wallet-config.md)。

### 消息签名

支持消息签名和 EIP-712 类型化数据签名：

```tsx
import { useWallet } from '@wkrjwlt/walletkit';

function MyComponent() {
  const { signMessage, address } = useWallet();

  const handleSign = async () => {
    try {
      const signature = await signMessage('Hello, World!');
      console.log('Signature:', signature);
    } catch (error) {
      console.error('Sign failed:', error);
    }
  };

  return <button onClick={handleSign}>Sign Message</button>;
}
```

### 钱包登录

支持安全的钱包登录机制：

```tsx
import { walletLogin } from '@wkrjwlt/walletkit';
import { useWallet } from '@wkrjwlt/walletkit';

function LoginComponent() {
  const { signMessage, isConnected } = useWallet();

  const handleLogin = async () => {
    if (!isConnected) return;

    const token = await walletLogin({
      signMessage: async (message) => await signMessage(message),
      getProvider: () => window.ethereum,
    }, 'My DApp');

    console.log('JWT Token:', token);
  };

  return <button onClick={handleLogin}>Login with Wallet</button>;
}
```

### 错误处理

完整的错误处理和状态管理：

```tsx
import { useWallet } from '@wkrjwlt/walletkit';

function MyComponent() {
  const { status, error, address } = useWallet();

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status === 'connecting') {
    return <div>Connecting...</div>;
  }

  if (status === 'connected' && address) {
    return <div>Connected: {address}</div>;
  }

  return <div>Not connected</div>;
}
```

### 框架集成

支持 Next.js、React、Vite 等主流框架。详细集成指南请查看 [框架集成文档](docs/framework-integration.md)。

## API

### WalletProvider

包裹你的应用以提供钱包上下文。

#### 基本使用

```tsx
<WalletProvider>
  <App />
</WalletProvider>
```

#### 自定义配置

```tsx
<WalletProvider config={{
  appName: 'My DApp',
  wallets: [
    { id: 'metamask', name: 'MetaMask Pro', icon: 'https://...' },
    { id: 'my-wallet', name: 'My Wallet', icon: 'https://...' },
  ],
  includeDefaultWallets: true,
}}>
  <App />
</WalletProvider>
```

### ConnectButton

显示连接钱包的按钮，连接成功后显示账户信息。

```tsx
<ConnectButton showBalance /> // showBalance: 是否显示余额
```

### useWallet Hook

获取钱包状态的 Hook，返回钱包上下文中的所有数据和方法。

```tsx
import { useWallet } from '@wkrjwlt/walletkit';

function MyComponent() {
  const {
    address,           // 钱包地址（0x开头）
    isConnected,       // 是否已连接
    isConnecting,      // 是否正在连接
    chainId,           // 当前链 ID
    balance,           // 余额（格式化后的字符串）
    connect,           // 连接钱包函数
    disconnect,        // 断开连接函数
    switchChain,       // 切换链函数
    signMessage,       // 签名消息函数（新增）
    connectors,        // wagmi connectors 列表
    walletActions,     // 自定义钱包操作列表（包含 name、icon、description 等）
    config,            // 钱包配置对象
    status,            // 钱包状态（新增：disconnected | connecting | connected | error）
    error,             // 错误信息（新增）
  } = useWallet();

  // 连接钱包
  const handleConnect = async () => {
    try {
      await connect('metamask');
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  // 断开连接
  const handleDisconnect = () => {
    disconnect();
  };

  // 切换链
  const handleSwitchChain = () => {
    switchChain(1); // 切换到以太坊主网
  };

  // 签名消息
  const handleSignMessage = async () => {
    try {
      const signature = await signMessage('Hello, World!');
      console.log('Signature:', signature);
    } catch (error) {
      console.error('签名失败:', error);
    }
  };

  // 显示自定义钱包列表
  return (
    <div>
      <p>状态: {status}</p>
      <p>地址: {address}</p>
      <p>余额: {balance} ETH</p>
      <p>链 ID: {chainId}</p>

      {error && (
        <div className="error">
          错误: {error.message}
        </div>
      )}

      <button onClick={handleConnect}>连接</button>
      <button onClick={handleDisconnect}>断开</button>
      <button onClick={handleSwitchChain}>切换链</button>
      <button onClick={handleSignMessage}>签名</button>

      {/* 显示自定义钱包列表 */}
      {walletActions.map(wallet => (
        <div key={wallet.id}>
          <img src={wallet.icon} alt={wallet.name} />
          <p>{wallet.name}</p>
          <p>{wallet.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 工具函数

#### getDefaultWallets()

获取默认钱包配置列表。

```tsx
import { getDefaultWallets } from '@wkrjwlt/walletkit';

const defaultWallets = getDefaultWallets();
// [
//   { id: 'metamask', name: 'MetaMask', icon: '...', ... },
//   { id: 'coinbase', name: 'Coinbase Wallet', icon: '...', ... },
//   { id: 'walletconnect', name: 'WalletConnect', icon: '...', ... },
// ]
```

#### mergeWalletConfigs()

合并自定义钱包配置与默认配置。

```tsx
import { mergeWalletConfigs } from '@wkrjwlt/walletkit';

const customWallets = [
  { id: 'metamask', name: 'MetaMask Pro' },
  { id: 'coinbase', enabled: false },
];

const merged = mergeWalletConfigs(customWallets);
```

## 支持的钱包

| 钱包 | ID |
|------|-----|
| MetaMask | `metamask` |
| Coinbase Wallet | `coinbase` |
| WalletConnect | `walletconnect` |

## 本地开发

```bash
# 安装依赖
pnpm install

# 构建库
pnpm build

# 运行 demo
pnpm demo
```

## License

MIT