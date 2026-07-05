import InjectedAdapter from './injected';

export class MetaMaskAdapter extends InjectedAdapter {
  id = 'metamask';
  name = 'MetaMask';

  protected getInjectedProvider(): any | null {
    const p = super.getInjectedProvider();
    if (!p) return null;
    // prefer provider flagged as MetaMask
    // some providers expose a list of providers; handle basic case
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ((p as any).isMetaMask || (p as any).isCoinbaseWallet === false) return p;
    return p;
  }
}

export default MetaMaskAdapter;
