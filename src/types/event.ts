export type WalletEvent = 'connect' | 'disconnect' | 'accountsChanged' | string;

export interface WalletEventPayload {
  type: WalletEvent;
  data?: any;
}
