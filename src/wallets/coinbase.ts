import InjectedAdapter from './injected';

export class CoinbaseAdapter extends InjectedAdapter {
  id = 'coinbase';
  name = 'Coinbase';

  protected getInjectedProvider(): any | null {
    const p = super.getInjectedProvider();
    if (!p) return null;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ((p as any).isCoinbaseWallet) return p;
    return p; // fallback to any injected provider
  }
}

export default CoinbaseAdapter;
