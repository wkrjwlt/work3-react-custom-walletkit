/**
 * wagmi connector for WLT Wallet
 *
 * 使用方式：
 * import { wltWallet } from '@wkrjwlt/walletkit'
 *
 * const config = createConfig({
 *   connectors: [
 *     injected(),
 *     walletConnect({ projectId }),
 *     wltWallet(),  // 添加这一行
 *   ],
 * })
 */
import { createConnector } from 'wagmi'

function getWltProvider(): any {
  if (typeof window === 'undefined') return undefined
  return (window as any).wltwallet
}

// @ts-ignore - wagmi v2 的 createConnector 类型太严格，这里用 any 绕过
export const wltWallet: any = createConnector((config: any) => ({
  id: 'wltWallet',
  name: 'WLT Wallet',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjNjY3ZWVhIi8+PHRleHQgeD0iMjAiIHk9IjI2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XTEQ8L3RleHQ+PC9zdmc+',
  type: 'injected' as const,
  downloadUrls: {},

  async connect() {
    const provider: any = getWltProvider()
    if (!provider) {
      window.open('https://github.com/wkrjwlt/wallet-demo', '_blank')
      throw new Error('WLT Wallet 未安装')
    }

    ;(this as any)._provider = provider

    const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' })
    ;(this as any)._accounts = accounts

    let chainId: number
    try {
      const chainIdHex: string = await provider.request({ method: 'eth_chainId' })
      chainId = parseInt(chainIdHex, 16)
    } catch {
      chainId = config.chains[0].id
    }
    ;(this as any)._chainId = chainId

    if (typeof provider.on === 'function') {
      provider.on('accountsChanged', (accounts: string[]) => {
        ;(this as any)._accounts = accounts
        ;(this as any).emit('accountsChanged', { accounts })
      })
      provider.on('chainChanged', (chainId: string) => {
        const parsed = parseInt(chainId, 16)
        ;(this as any)._chainId = parsed
        ;(this as any).emit('chainChanged', { chainId: parsed })
      })
    }

    return {
      accounts: accounts as readonly `0x${string}`[],
      chainId,
    }
  },

  async disconnect() {
    ;(this as any)._provider = undefined
    ;(this as any)._chainId = undefined
    ;(this as any)._accounts = undefined
  },

  async getAccounts() {
    const provider: any = (this as any)._provider || getWltProvider()
    if (!provider) return []
    const accounts: string[] = await provider.request({ method: 'eth_accounts' })
    ;(this as any)._accounts = accounts
    return accounts as readonly `0x${string}`[]
  },

  async getChainId() {
    if ((this as any)._chainId) return (this as any)._chainId

    const provider: any = (this as any)._provider || getWltProvider()
    if (!provider) return config.chains[0].id

    try {
      const chainIdHex: string = await provider.request({ method: 'eth_chainId' })
      const parsed = parseInt(chainIdHex, 16)
      ;(this as any)._chainId = parsed
      return parsed
    } catch {
      return config.chains[0].id
    }
  },

  async isAuthorized() {
    try {
      const provider: any = (this as any)._provider || getWltProvider()
      if (!provider) return false
      const accounts: string[] = await provider.request({ method: 'eth_accounts' })
      return accounts.length > 0
    } catch {
      return false
    }
  },

  async getProvider() {
    const provider = (this as any)._provider || getWltProvider()
    return provider
  },

  // 事件回调（required by wagmi connector interface）
  onAccountsChanged(accounts: string[]) {
    ;(this as any)._accounts = accounts
    ;(this as any).emit('accountsChanged', { accounts })
  },

  onChainChanged(chainId: string | number) {
    const parsed = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId
    ;(this as any)._chainId = parsed
    ;(this as any).emit('chainChanged', { chainId: parsed })
  },

  onDisconnect() {
    ;(this as any)._provider = undefined
    ;(this as any)._chainId = undefined
    ;(this as any)._accounts = undefined
  },
}))

// 辅助函数：检测 WLT 钱包是否已安装
export function isWltWalletInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).wltwallet?.isWltWallet
}
