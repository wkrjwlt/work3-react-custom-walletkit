export abstract class BaseWalletAdapter {
  abstract id: string;
  abstract name: string;
  abstract connect(): Promise<string[]>;
  abstract disconnect(): Promise<void>;
}
