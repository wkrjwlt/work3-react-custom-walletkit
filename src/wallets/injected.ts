import { BaseWalletAdapter } from './base';

export abstract class InjectedAdapter extends BaseWalletAdapter {
  protected provider: any | null = null;

  getProvider(): any | null {
    if (this.provider) return this.provider;
    const injected = this.getInjectedProvider();
    if (injected) {
      this.provider = injected;
    }
    return this.provider;
  }

  protected getInjectedProvider(): any | null {
    // Try common injection points
    if (typeof window === 'undefined') return null;
    // modern dapps expose window.ethereum
    // some wallets attach to window.ethereum with flags
    // fallback: window.web3?.currentProvider
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (window as any).ethereum || (window as any).web3?.currentProvider || null;
  }

  async connect(): Promise<string[]> {
    const provider = this.getInjectedProvider();
    if (!provider) throw new Error('No injected provider found');
    this.provider = provider;
    // EIP-1102 / EIP-1193 request accounts
    if (typeof provider.request === 'function') {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      return Array.isArray(accounts) ? accounts : [];
    }

    // legacy providers
    if (provider.enable) {
      const accounts = await provider.enable();
      return Array.isArray(accounts) ? accounts : [];
    }

    throw new Error('Injected provider does not support account requests');
  }

  async disconnect(): Promise<void> {
    // injected providers typically don't expose a disconnect API
    this.provider = null;
  }
}

export default InjectedAdapter;
