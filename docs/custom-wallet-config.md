# 钱包配置说明

## 功能说明

WalletKit 支持修改现有钱包的显示属性，包括名称、描述、图标等。

## 基本使用

### 1. 使用默认钱包（推荐）

```tsx
import { WalletProvider } from '@wkrjwlt/walletkit';

function App() {
  return (
    <WalletProvider>
      <YourApp />
    </WalletProvider>
  );
}
```

默认包含三个钱包：MetaMask、Coinbase Wallet、WalletConnect，并使用真实的钱包图标。

### 2. 修改钱包显示属性

```tsx
import { WalletProvider } from '@wkrjwlt/walletkit';
import type { WalletKitConfig } from '@wkrjwlt/walletkit';

function App() {
  const config: WalletKitConfig = {
    // 应用名称
    appName: 'My DApp',

    // 自定义钱包列表（修改显示属性）
    wallets: [
      // 修改 MetaMask 的显示属性
      {
        id: 'metamask',
        name: 'MetaMask Pro', // 修改显示名称
        description: '我的自定义描述', // 修改描述
        loadingText: '正在连接...', // 修改加载提示
      },

      // 禁用某个钱包
      {
        id: 'coinbase',
        enabled: false, // 设置为 false 则不会显示
      },
    ],
  };

  return (
    <WalletProvider config={config}>
      <YourApp />
    </WalletProvider>
  );
}
```

## 支持的配置

### WalletConfig

```typescript
interface WalletConfig {
  /** 钱包唯一标识（只能是 metamask、coinbase、walletconnect） */
  id: string;

  /** 钱包显示名称（可选） */
  name?: string;

  /** 钱包图标（可选，SVG data URL 或图片 URL） */
  icon?: string;

  /** 钱包描述文字（可选） */
  description?: string;

  /** 连接时显示的加载文字（可选） */
  loadingText?: string;

  /** 是否启用此钱包（可选，默认 true） */
  enabled?: boolean;

  /** 是否在列表中显示（可选，默认 true） */
  visible?: boolean;
}
```

### WalletKitConfig

```typescript
interface WalletKitConfig {
  /** 应用名称 */
  appName?: string;

  /** 支持的链列表 */
  chains?: Chain[];

  /** 钱包配置列表 */
  wallets?: WalletConfig[];

  /** 自定义样式配置 */
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
  };
}
```

## 注意事项

1. **只能修改现有钱包**：不支持添加全新的自定义钱包，因为需要有对应的 wagmi connector 才能真正连接。

2. **钱包 ID 必须正确**：
   - `metamask` - MetaMask
   - `coinbase` - Coinbase Wallet
   - `walletconnect` - WalletConnect

3. **默认图标**：内置了真实的钱包图标，无需手动设置。

4. **禁用钱包**：设置 `enabled: false` 可以隐藏不需要的钱包。

## 工具函数

### getDefaultWallets()

获取默认钱包配置列表。

```tsx
import { getDefaultWallets } from '@wkrjwlt/walletkit';

const wallets = getDefaultWallets();
// [
//   { id: 'metamask', name: 'MetaMask', icon: '...', ... },
//   { id: 'coinbase', name: 'Coinbase Wallet', icon: '...', ... },
//   { id: 'walletconnect', name: 'WalletConnect', icon: '...', ... },
// ]
```

### mergeWalletConfigs()

合并自定义配置与默认配置。

```tsx
import { mergeWalletConfigs } from '@wkrjwlt/walletkit';

const customWallets = [
  { id: 'metamask', name: 'MetaMask Pro' },
  { id: 'coinbase', enabled: false },
];

const merged = mergeWalletConfigs(customWallets);
```

## 完整示例

查看 [demo/index.tsx](../demo/index.tsx) 文件中的完整使用示例。