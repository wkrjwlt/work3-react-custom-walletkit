import { BaseWalletAdapter } from './base';

export class CoinbaseAdapter extends BaseWalletAdapter {
  id = 'coinbase';
  name = 'Coinbase';
  provider: any | null = null;

  getProvider(): any | null {
    if (this.provider) return this.provider;
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;

    // use injected Coinbase provider if available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (ethereum.isCoinbaseWallet) {
      this.provider = ethereum;
    } else if (ethereum.providers && Array.isArray(ethereum.providers)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.provider = ethereum.providers.find((p: any) => p.isCoinbaseWallet) || null;
    }

    return this.provider;
  }

  async connect(): Promise<string[]> {
    try {
      // Try using official Coinbase Wallet SDK first
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk');
      const sdk = new CoinbaseWalletSDK({
        appName: 'Wallet Kit',
        appLogoUrl: '',
        darkMode: false,
      });
      const provider = sdk.makeWeb3Provider();
      this.provider = provider;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      return Array.isArray(accounts) ? accounts : [];
    } catch (sdkErr) {
      // SDK not available, try injected provider
      try {
        if (typeof window === 'undefined') throw new Error('No window object');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ethereum = (window as any).ethereum;
        if (!ethereum) throw new Error('No injected provider found');
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!ethereum.isCoinbaseWallet && !ethereum.providers?.some((p: any) => p.isCoinbaseWallet)) {
          throw new Error('Coinbase Wallet not detected');
        }
        
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const provider = ethereum.isCoinbaseWallet ? ethereum : ethereum.providers?.find((p: any) => p.isCoinbaseWallet);
        if (!provider) throw new Error('Could not find Coinbase provider');
        
        this.provider = provider;
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        return Array.isArray(accounts) ? accounts : [];
      } catch (injectedErr: any) {
        throw new Error(
          `Coinbase Wallet not available. Install the extension or run: npm install @coinbase/wallet-sdk. Error: ${injectedErr.message}`
        );
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider && typeof this.provider.disconnect === 'function') {
      try {
        await this.provider.disconnect();
      } catch (e) {
        // ignore
      }
    }
    this.provider = null;
  }
}

export default CoinbaseAdapter;
