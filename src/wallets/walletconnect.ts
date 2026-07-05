import { BaseWalletAdapter } from './base';

export class WalletConnectAdapter extends BaseWalletAdapter {
  id = 'walletconnect';
  name = 'WalletConnect';

  async connect(): Promise<string[]> {
    return [];
  }

  async disconnect(): Promise<void> {}
}

export default WalletConnectAdapter;
