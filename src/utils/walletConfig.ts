import { metamaskIcon, walletconnectIcon, coinbaseIcon } from '../assets/icons';
import type { WalletConfig, WalletAction } from '../types/wallet';

/**
 * 获取默认钱包配置列表
 */
export function getDefaultWallets(): WalletConfig[] {
  return [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: metamaskIcon,
      description: '桌面浏览器插件钱包，适合常用桌面环境。',
      loadingText: '正在打开 MetaMask...',
      enabled: true,
      visible: true,
    },
    {
      id: 'wlt',
      name: 'WLT Wallet',
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23e94560'/><text x='50' y='65' font-size='40' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'>W</text></svg>",
      description: 'WLT 自定义钱包，支持助记词导入和多账户管理。',
      loadingText: '正在连接 WLT Wallet...',
      enabled: true,
      visible: true,
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: coinbaseIcon,
      description: 'Coinbase Wallet，可通过浏览器扩展或移动端授权登录。',
      loadingText: '正在打开 Coinbase Wallet...',
      enabled: true,
      visible: true,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: walletconnectIcon,
      description: '扫码连接移动钱包，支持多种钱包应用。',
      loadingText: '正在准备 WalletConnect 会话...',
      enabled: true,
      visible: true,
    },
  ];
}

/**
 * 合并用户自定义钱包配置与默认配置
 * 注意：只能修改现有钱包的显示属性，不能添加新的自定义钱包
 * @param customWallets 用户自定义钱包配置
 */
export function mergeWalletConfigs(
  customWallets: WalletConfig[] = []
): WalletAction[] {
  const defaultWallets = getDefaultWallets();

  // 创建默认钱包的映射
  const walletMap = new Map<string, WalletAction>();
  defaultWallets.forEach(wallet => {
    walletMap.set(wallet.id, {
      id: wallet.id,
      name: wallet.name || wallet.id,
      icon: wallet.icon,
      description: wallet.description,
      loadingText: wallet.loadingText,
    });
  });

  // 用用户配置覆盖默认配置（只修改显示属性）
  customWallets.forEach(customWallet => {
    const existing = walletMap.get(customWallet.id);
    if (existing) {
      // 只更新显示属性，不添加新的钱包
      walletMap.set(customWallet.id, {
        ...existing,
        name: customWallet.name || existing.name,
        icon: customWallet.icon || existing.icon,
        description: customWallet.description || existing.description,
        loadingText: customWallet.loadingText || existing.loadingText,
      });
    }
    // 忽略不存在的钱包 ID（不添加新钱包）
  });

  // 转换为数组并过滤禁用的钱包
  return Array.from(walletMap.values()).filter(w => {
    const customConfig = customWallets.find(c => c.id === w.id);
    return customConfig?.enabled !== false;
  });
}