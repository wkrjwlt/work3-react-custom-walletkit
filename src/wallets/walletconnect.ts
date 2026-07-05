import { BaseWalletAdapter } from './base';

export class WalletConnectAdapter extends BaseWalletAdapter {
  id = 'walletconnect';
  name = 'WalletConnect';

  // Note: this implementation uses dynamic import of @walletconnect/web3-provider.
  // If the package is not installed, connect() will throw an instructive error.
  provider: any | null = null;

  async connect(): Promise<string[]> {
    try {
      // dynamic import so dependency is optional
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const WalletConnectProvider = (await import('@walletconnect/web3-provider')).default;
      // create provider (user should set RPC/infura etc. in options as needed)
      const wcProvider = new WalletConnectProvider({
        // user should configure RPC or infuraId in app environment
      });
      this.provider = wcProvider;
      await wcProvider.enable();
      // provider may expose accounts array
      const accounts = wcProvider.accounts || (await wcProvider.request({ method: 'eth_accounts' }));
      return Array.isArray(accounts) ? accounts : [];
    } catch (err) {
      throw new Error("WalletConnect provider not available. Install '@walletconnect/web3-provider' and configure RPC options.");
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider && typeof this.provider.disconnect === 'function') {
      await this.provider.disconnect();
    }
    this.provider = null;
  }
}

export default WalletConnectAdapter;
