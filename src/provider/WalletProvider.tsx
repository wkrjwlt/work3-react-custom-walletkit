import React, { useState, useCallback, useRef, useEffect } from 'react';
import { WalletContext } from './context';
import type { ConnectedWallet } from '../types/wallet';
import { MetaMaskAdapter } from '../wallets/metamask';
import { CoinbaseAdapter } from '../wallets/coinbase';
import { WalletConnectAdapter } from '../wallets/walletconnect';

type AdapterInstance = {
  id: string;
  instance: any;
};

const ADAPTERS: AdapterInstance[] = [
  { id: 'metamask', instance: new MetaMaskAdapter() },
  { id: 'coinbase', instance: new CoinbaseAdapter() },
  { id: 'walletconnect', instance: new WalletConnectAdapter() },
];

export const WalletProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const currentAdapter = useRef<any | null>(null);

  const getChainId = useCallback(async (adapter: any): Promise<number | undefined> => {
    try {
      const provider = adapter.getProvider?.();
      if (provider && typeof provider.request === 'function') {
        const chainHex = await provider.request({ method: 'eth_chainId' });
        if (chainHex) return parseInt(chainHex as string, 16);
      }
    } catch (e) {
      // ignore
    }
    return undefined;
  }, []);

  const getBalance = useCallback(async (adapter: any, address: string): Promise<string | undefined> => {
    try {
      const provider = adapter.getProvider?.();
      if (provider && typeof provider.request === 'function') {
        const balance = await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] });
        if (balance) return balance as string;
      }
    } catch (e) {
      // ignore
    }
    return undefined;
  }, []);

  const connect = useCallback(async (id: string) => {
    const found = ADAPTERS.find(a => a.id === id);
    if (!found) throw new Error(`Unknown wallet adapter: ${id}`);
    const adapter = found.instance;
    currentAdapter.current = adapter;

    const accounts: string[] = await adapter.connect();
    const address = accounts && accounts.length ? accounts[0] : '';

    const chainId = await getChainId(adapter);
    const balance = await getBalance(adapter, address);

    const cw: ConnectedWallet = { id, address, chainId, balance };
    setWallet(cw);
    try {
      localStorage.setItem('connectedWallet', JSON.stringify(cw));
    } catch (e) {
      // ignore storage errors
    }
  }, [getChainId, getBalance]);

  const disconnect = useCallback(async () => {
    try {
      if (currentAdapter.current && typeof currentAdapter.current.disconnect === 'function') {
        await currentAdapter.current.disconnect();
      }
    } catch (e) {
      // ignore
    }
    currentAdapter.current = null;
    setWallet(null);
    try {
      localStorage.removeItem('connectedWallet');
    } catch (e) {}
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!currentAdapter.current) throw new Error('No wallet connected');
    const provider = currentAdapter.current.getProvider?.();
    if (!provider) throw new Error('Provider not available');
    
    try {
      // Try wallet_switchEthereumChain (EIP-3326)
      const chainHex = `0x${chainId.toString(16)}`;
      await provider.request?.({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainHex }] });
      
      // Update wallet state with new chainId and refresh balance
      if (wallet) {
        const balance = await getBalance(currentAdapter.current, wallet.address);
        const updated = { ...wallet, chainId, balance };
        setWallet(updated);
        try {
          localStorage.setItem('connectedWallet', JSON.stringify(updated));
        } catch (e) {}
      }
    } catch (error: any) {
      // Handle user rejection or chain doesn't exist
      if (error.code === 4902) {
        throw new Error(`Chain ${chainId} not added to wallet`);
      }
      throw error;
    }
  }, [wallet, getBalance]);

  // Attempt to auto-reconnect if a wallet was persisted
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = localStorage.getItem('connectedWallet');
        if (!raw) return;
        const parsed = JSON.parse(raw) as ConnectedWallet;
        if (!parsed || !parsed.id) return;
        // try silent connect for the same adapter
        const found = ADAPTERS.find(a => a.id === parsed.id);
        if (!found) return;
        const adapter = found.instance;
        currentAdapter.current = adapter;
        const accounts: string[] = await adapter.connect();
        const address = accounts && accounts.length ? accounts[0] : parsed.address;
        const chainId = await getChainId(adapter);
        const balance = await getBalance(adapter, address);
        if (!mounted) return;
        setWallet({ id: parsed.id, address, chainId, balance });
      } catch (e) {
        // cannot auto-reconnect — ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getChainId, getBalance]);

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, switchNetwork }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
