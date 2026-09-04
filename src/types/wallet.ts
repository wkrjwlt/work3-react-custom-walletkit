import type { Chain } from 'viem';

export type WalletId = 'metamask' | 'walletconnect' | 'coinbase' | string;

/**
 * 钱包账户信息
 */
export interface WalletAccountInfo {
  /** 钱包地址 */
  address: string;
  /** 链 ID */
  chainId?: number;
  /** ENS 名称 */
  ens?: string;
  /** 余额 */
  balance?: string;
}

export interface WalletInfo {
  id: WalletId;
  name: string;
  icon?: string;
  ready?: boolean;
}

export interface WalletConfig {
  /** 钱包唯一标识 */
  id: string;
  /** 钱包显示名称 */
  name?: string;
  /** 钱包图标 (SVG data URL 或图片 URL) */
  icon?: string;
  /** 钱包描述文字 */
  description?: string;
  /** 连接时显示的加载文字 */
  loadingText?: string;
  /** 是否启用此钱包 */
  enabled?: boolean;
  /** 是否在列表中显示 */
  visible?: boolean;
}

export interface WalletKitConfig {
  /** 应用名称 */
  appName?: string;
  /** 支持的链列表 */
  chains?: Chain[];
  /** 钱包配置列表（用于修改默认钱包的显示属性） */
  wallets?: WalletConfig[];
  /** 各链的 RPC URL（用于查询不同链上的余额） */
  rpcUrls?: Record<number, string>;
  /** 自定义样式配置 */
  theme?: {
    /** 主色调 */
    primaryColor?: string;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 文字颜色 */
    textColor?: string;
    /** 圆角大小 */
    borderRadius?: string;
  };
}

export interface ConnectedWallet {
  id: WalletId;
  address: string;
  chainId?: number;
  balance?: string; // balance in wei as string
  walletName?: string;
  walletIcon?: string;
}

export type WalletAction = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  loadingText?: string;
};

/**
 * 钱包状态
 */
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * 钱包错误类型
 */
export interface WalletError {
  code: number;
  message: string;
  data?: any;
}
