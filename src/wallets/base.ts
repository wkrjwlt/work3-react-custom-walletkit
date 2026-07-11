export abstract class BaseWalletAdapter {
  abstract id: string;
  abstract name: string;
  abstract connect(onUri?: (uri: string) => void): Promise<string[]>;
  abstract disconnect(): Promise<void>;
  getProvider(): any | null {
    return null;
  }
}
