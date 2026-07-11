import InjectedAdapter from './injected';

export class MetaMaskAdapter extends InjectedAdapter {
  id = 'metamask';
  name = 'MetaMask';

  protected getInjectedProvider(): any | null {
    if (typeof window === 'undefined') return null;
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;
    
    // MetaMask sets isMetaMask flag
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (ethereum.isMetaMask) return ethereum;
    
    // Some environments have multiple providers, try to find MetaMask
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (ethereum.providers && Array.isArray(ethereum.providers)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const mm = ethereum.providers.find((p: any) => p.isMetaMask);
      if (mm) return mm;
    }
    
    return ethereum;
  }

  async connect(): Promise<string[]> {
    const provider = this.getInjectedProvider();
    if (!provider) throw new Error('MetaMask extension not found. Please install it first.');
    this.provider = provider;
    
    try {
      // Use wallet_requestPermissions when supported, but only fall back to eth_requestAccounts
      // if the method is truly unsupported. If the user cancels the popup, propagate the error.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (typeof provider.request === 'function') {
        try {
          await provider.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (e: any) {
          const unsupported =
            e &&
            (e.code === -32601 ||
              (typeof e.message === 'string' && e.message.includes('wallet_requestPermissions') && e.message.includes('does not exist')));
          if (!unsupported) {
            throw e;
          }
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        return Array.isArray(accounts) ? accounts : [];
      }
    } catch (err: any) {
      throw new Error(`MetaMask connection failed: ${err.message}`);
    }
    
    throw new Error('MetaMask does not support account requests');
  }
}

export default MetaMaskAdapter;
