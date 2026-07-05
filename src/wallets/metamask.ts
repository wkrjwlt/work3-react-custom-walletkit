import { BaseWalletAdapter } from './base';

export class MetaMaskAdapter extends BaseWalletAdapter {
  id = 'metamask';
  name = 'MetaMask';

  async connect(): Promise<string[]> {
    // placeholder implementation
    return [];
  }

  async disconnect(): Promise<void> {
    // placeholder
  }
}

export default MetaMaskAdapter;
