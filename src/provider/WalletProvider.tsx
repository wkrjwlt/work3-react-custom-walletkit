import React from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useSignMessage, usePublicClient } from 'wagmi';
import type { WalletKitConfig, WalletConfig, WalletAction, WalletStatus, WalletError } from '../types/wallet';
import { mergeWalletConfigs } from '../utils/walletConfig';

interface WalletContextState {
  address?: `0x${string}` | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  chainId?: number;
  balance?: string;
  connect: (connectorId: string) => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => void;
  signMessage: (message: string) => Promise<string>;
  connectors: { id: string; name: string; icon?: string }[];
  walletActions: WalletAction[];
  config?: WalletKitConfig;
  status: WalletStatus;
  error?: WalletError;
}

const WalletContext = React.createContext<WalletContextState>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  chainId: undefined,
  balance: undefined,
  connect: async () => {},
  disconnect: () => {},
  switchChain: () => {},
  signMessage: async () => '',
  connectors: [],
  walletActions: [],
  config: undefined,
  status: 'disconnected',
  error: undefined,
});

export const useWallet = () => React.useContext(WalletContext);

// 钱包图标映射 - 支持多种 id 格式
const WALLET_ICONS: Record<string, string> = {
  // MetaMask
  metamask: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI4IDI4Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDI4djI4SDB6Ii8+PGcgY2xpcC1wYXRoPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjZmY1YzE2IiBkPSJtMjQuMDI0IDIzLjgyNC00Ljg0Ni0xLjQzNC0zLjY1NSAyLjE3Mi0yLjU1LS4wMDEtMy42NTYtMi4xNzEtNC44NDQgMS40MzRMMyAxOC44OGwxLjQ3My01LjQ4OEwzIDguNzUxIDQuNDczIDNsNy41NjkgNC40OTZoNC40MTNMMjQuMDI0IDNsMS40NzMgNS43NTEtMS40NzMgNC42NCAxLjQ3MyA1LjQ4OHoiLz48cGF0aCBmaWxsPSIjZmY1YzE2IiBkPSJtNC40NzQgMyA3LjU3IDQuNDk5LS4zMDIgMy4wODd6bTQuODQ0IDE1Ljg4MSAzLjMzIDIuNTIyLTMuMzMuOTg3em0zLjA2NC00LjE3LS42NC00LjEyMy00LjA5NyAyLjgwNGgtLjAwMnYuMDAxbC4wMTMgMi44ODYgMS42NjEtMS41Njd6TTI0LjAyNCAzbC03LjU3IDQuNDk5LjMgMy4wODd6TTE5LjE4IDE4Ljg4MWwtMy4zMyAyLjUyMiAzLjMzLjk4N3ptMS42NzQtNS40ODh2LS4wMDJsLTQuMDk3LTIuODA0LS42NCA0LjEyNGgzLjA2NGwxLjY2MiAxLjU2N3oiLz48cGF0aCBmaWxsPSIjZTM0ODA3IiBkPSJtOS4zMTcgMjIuMzktNC44NDQgMS40MzRMMyAxOC44ODFoNi4zMTd6bTMuMDY0LTcuNjguOTI1IDUuOTYyLTEuMjgyLTMuMzE1LTQuMzctMS4wNzggMS42NjItMS41Njh6bTYuNzk5IDcuNjggNC44NDQgMS40MzQgMS40NzMtNC45NDNIMTkuMTh6bS0zLjA2NC03LjY4LS45MjUgNS45NjIgMS4yODItMy4zMTUgNC4zNy0xLjA3OC0xLjY2My0xLjU2OHoiLz48cGF0aCBmaWxsPSIjZmY4ZDVkIiBkPSJtMyAxOC44OCAxLjQ3My01LjQ4OWgzLjE2OWwuMDEyIDIuODg3IDQuMzcgMS4wNzggMS4yODIgMy4zMTQtLjY1OS43My0zLjMzLTIuNTIySDN6bTIyLjQ5NyAwLTEuNDczLTUuNDg5aC0zLjE3bC0uMDEgMi44ODctNC4zNzEgMS4wNzgtMS4yODIgMy4zMTQuNjU5LjczIDMuMzMtMi41MjJoNi4zMTd6TTE2LjQ1NSA3LjQ5NWgtNC40MTNsLS4zIDMuMDg3IDEuNTY1IDEwLjA4NGgxLjg4NGwxLjU2NS0xMC4wODR6Ii8+PHBhdGggZmlsbD0iIzY2MTgwMCIgZD0iTTQuNDczIDMgMyA4Ljc1MWwxLjQ3MyA0LjY0aDMuMTY5bDQuMS0yLjgwNXptNi45OTIgMTIuOTA4SDEwLjAzbC0uNzgxLjc2MSAyLjc3Ni42ODUtLjU2LTEuNDQ3TTI0LjAyNCAzbDEuNDczIDUuNzUxLTEuNDczIDQuNjRoLTMuMTdsLTQuMDk4LTIuODA1em0tNi45OSAxMi45MDhoMS40MzdsLjc4Mi43NjItMi43OC42ODYuNTYtMS40NXptLTEuNTEyIDYuNjg3LjMyOC0xLjE5My0uNjYtLjczaC0xLjg4NWwtLjY1OS43My4zMjcgMS4xOTIiLz48cGF0aCBmaWxsPSIjYzBjNGNkIiBkPSJNMTUuNTIyIDIyLjU5NHYxLjk2OWgtMi41NDh2LTEuOTY5eiIvPjxwYXRoIGZpbGw9IiNlN2ViZjYiIGQ9Im05LjMxOCAyMi4zODggMy42NTggMi4xNzR2LTEuOTY5bC0uMzI4LTEuMTkyem05Ljg2MiAwLTMuNjU4IDIuMTc0di0xLjk2OWwuMzI4LTEuMTkyeiIvPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9ImEiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zIDNoMjIuNXYyMS41NjNIM3oiLz48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4=',
  'io.metamask': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI4IDI4Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDI4djI4SDB6Ii8+PGcgY2xpcC1wYXRoPSJ1cmwoI2EpIj48cGF0aCBmaWxsPSIjZmY1YzE2IiBkPSJtMjQuMDI0IDIzLjgyNC00Ljg0Ni0xLjQzNC0zLjY1NSAyLjE3Mi0yLjU1LS4wMDEtMy42NTYtMi4xNzEtNC44NDQgMS40MzRMMyAxOC44OGwxLjQ3My01LjQ4OEwzIDguNzUxIDQuNDczIDNsNy41NjkgNC40OTZoNC40MTNMMjQuMDI0IDNsMS40NzMgNS43NTEtMS40NzMgNC42NCAxLjQ3MyA1LjQ4OHoiLz48cGF0aCBmaWxsPSIjZmY1YzE2IiBkPSJtNC40NzQgMyA3LjU3IDQuNDk5LS4zMDIgMy4wODd6bTQuODQ0IDE1Ljg4MSAzLjMzIDIuNTIyLTMuMzMuOTg3em0zLjA2NC00LjE3LS42NC00LjEyMy00LjA5NyAyLjgwNGgtLjAwMnYuMDAxbC4wMTMgMi44ODYgMS42NjEtMS41Njd6TTI0LjAyNCAzbC03LjU3IDQuNDk5LjMgMy4wODd6TTE5LjE4IDE4Ljg4MWwtMy4zMyAyLjUyMiAzLjMzLjk4N3ptMS42NzQtNS40ODh2LS4wMDJsLTQuMDk3LTIuODA0LS42NCA0LjEyNGgzLjA2NGwxLjY2MiAxLjU2N3oiLz48cGF0aCBmaWxsPSIjZTM0ODA3IiBkPSJtOS4zMTcgMjIuMzktNC44NDQgMS40MzRMMyAxOC44ODFoNi4zMTd6bTMuMDY0LTcuNjguOTI1IDUuOTYyLTEuMjgyLTMuMzE1LTQuMzctMS4wNzggMS42NjItMS41Njh6bTYuNzk5IDcuNjggNC44NDQgMS40MzQgMS40NzMtNC45NDNIMTkuMTh6bS0zLjA2NC03LjY4LS45MjUgNS45NjIgMS4yODItMy4zMTUgNC4zNy0xLjA3OC0xLjY2My0xLjU2OHoiLz48cGF0aCBmaWxsPSIjZmY4ZDVkIiBkPSJtMyAxOC44OCAxLjQ3My01LjQ4OWgzLjE2OWwuMDEyIDIuODg3IDQuMzcgMS4wNzggMS4yODIgMy4zMTQtLjY1OS43My0zLjMzLTIuNTIySDN6bTIyLjQ5NyAwLTEuNDczLTUuNDg5aC0zLjE3bC0uMDEgMi44ODctNC4zNzEgMS4wNzgtMS4yODIgMy4zMTQuNjU5LjczIDMuMzMtMi41MjJoNi4zMTd6TTE2LjQ1NSA3LjQ5NWgtNC40MTNsLS4zIDMuMDg3IDEuNTY1IDEwLjA4NGgxLjg4NGwxLjU2NS0xMC4wODR6Ii8+PHBhdGggZmlsbD0iIzY2MTgwMCIgZD0iTTQuNDczIDMgMyA4Ljc1MWwxLjQ3MyA0LjY0aDMuMTY5bDQuMS0yLjgwNXptNi45OTIgMTIuOTA4SDEwLjAzbC0uNzgxLjc2MSAyLjc3Ni42ODUtLjU2LTEuNDQ3TTI0LjAyNCAzbDEuNDczIDUuNzUxLTEuNDczIDQuNjRoLTMuMTdsLTQuMDk4LTIuODA1em0tNi45OSAxMi45MDhoMS40MzdsLjc4Mi43NjItMi43OC42ODYuNTYtMS40NXptLTEuNTEyIDYuNjg3LjMyOC0xLjE5My0uNjYtLjczaC0xLjg4NWwtLjY1OS43My4zMjcgMS4xOTIiLz48cGF0aCBmaWxsPSIjYzBjNGNkIiBkPSJNMTUuNTIyIDIyLjU5NHYxLjk2OWgtMi41NDh2LTEuOTY5eiIvPjxwYXRoIGZpbGw9IiNlN2ViZjYiIGQ9Im05LjMxOCAyMi4zODggMy42NTggMi4xNzR2LTEuOTY5bC0uMzI4LTEuMTkyem05Ljg2MiAwLTMuNjU4IDIuMTc0di0xLjk2OWwuMzI4LTEuMTkyeiIvPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9ImEiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0zIDNoMjIuNXYyMS41NjNIM3oiLz48L2NsaXBQYXRoPjwvZGVmcz48L3N2Zz4=',
  // Coinbase Wallet
  coinbase: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMDA1MkZGIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwIDhDMTMuMzczIDggOCAxMy4zNzMgOCAyMGMwIDYuNjI3IDUuMzczIDEyIDEyIDEyYzYuNjI3IDAgMTItNS4zNzMgMTItMTJDMzIgMTMuMzczIDI2LjYyNyA4IDIwIDh6bTAgMTljLTMuODY2IDAtNy0zLjEzNC03LTdzMy4xMzQtNyA3LTdzNyAzLjEzNCA3IDctMy4xMzQgNy03IDd6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwIDE0Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2IDYtMi42ODYgNi02LTIuNjg2LTYtNi02em0zIDZjMCAxLjY1Ny0xLjM0MyAzLTMgM3MtMy0xLjM0My0zLTMgMS4zNDMtMyAzLTMgMyAxLjM0MyAzIDN6Ii8+PC9zdmc+',
  coinbasewallet: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMDA1MkZGIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwIDhDMTMuMzczIDggOCAxMy4zNzMgOCAyMGMwIDYuNjI3IDUuMzczIDEyIDEyIDEyYzYuNjI3IDAgMTItNS4zNzMgMTItMTJDMzIgMTMuMzczIDI2LjYyNyA4IDIwIDh6bTAgMTljLTMuODY2IDAtNy0zLjEzNC03LTdzMy4xMzQtNyA3LTdzNyAzLjEzNCA3IDctMy4xMzQgNy03IDd6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwIDE0Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2IDYtMi42ODYgNi02LTIuNjg2LTYtNi02em0zIDZjMCAxLjY1Ny0xLjM0MyAzLTMgM3MtMy0xLjM0My0zLTMgMS4zNDMtMyAzLTMgMyAxLjM0MyAzIDN6Ii8+PC9zdmc+',
  'coinbaseWalletSDK': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHJ4PSI4IiBmaWxsPSIjMDA1MkZGIi8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwIDhDMTMuMzczIDggOCAxMy4zNzMgOCAyMGMwIDYuNjI3IDUuMzczIDEyIDEyIDEyYzYuNjI3IDAgMTItNS4zNzMgMTItMTJDMzIgMTMuMzczIDI2LjYyNyA4IDIwIDh6bTAgMTljLTMuODY2IDAtNy0zLjEzNC03LTdzMy4xMzQtNyA3LTdzNyAzLjEzNCA3IDctMy4xMzQgNy03IDd6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIwIDE0Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2IDYtMi42ODYgNi02LTIuNjg2LTYtNi02em0zIDZjMCAxLjY1Ny0xLjM0MyAzLTMgM3MtMy0xLjM0My0zLTMgMS4zNDMtMyAzLTMgMyAxLjM0MyAzIDN6Ii8+PC9zdmc+',
  // WalletConnect
  walletconnect: 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMxLjM0NTk2IiB2aWV3Qm94PSIwIDAgMzIgMzEuMzQ1OTYiIHdpZHRoPSIzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjM2I5OWZjIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im0xNi4wMDEwOTUgOC4zOTgwMDE3YzQuMDQ3ODM2LS4wMDI4ODkgNy45MDQ2OTcgMS41MjU0NzkzIDEwLjc3MTAwOCA0LjI1MTI0OTNsMS4wODQ5NDEtMS4wNTY3MjljLTMuMjY4NjU4LTMuMTU0OTg3My03LjY4OTg1Ny00LjkzMTUyMjQtMTIuMjg4NzE0LTQuOTI4NjMzNy00LjU5ODg1NzcuMDAyODkwNi05LjAxNzQxMDcgMS43ODI1MTc0LTEyLjI4MzQ3MDcgNC45NDA0OTQ3bDEuMDg0NjM2NyAxLjA1NzQ2N2MyLjg2NDEwMTktMi43Mjk0NCA2LjcyMDY5MS00LjI2MDMxNTkgMTAuNjMxNTk5LTQuMjYzODQ4em0tLjAwMTIwNiA1LjM3NjA0OTNjMi4zMzYyMDEtLjAwMTY2NiA0LjU2MDYyMS44OCA2LjIxNDg0NSAyLjQ1NjY5MWwxLjA4NDYzNy0xLjA1NzQ2N2MtMi4wNzE4NzUtMS45OTgwMDEtNC44NzIwNDUtMy4xMjEyOTUtNy43OTc5MzctMy4xMjEyOTUtMi45MjU4OTIgMC01LjcyNjA2MiAxLjEyMzI5NC03Ljc5NzkzNyAzLjEyMTI5NWwxLjA4NDYzNyAxLjA1NzQ2N2MxLjY1MzYyOS0xLjU3NjEwNiAzLjg3NjkxOS0yLjQ1NTM5NiA2LjIxMTc1NS0yLjQ1NjY5MXptLjAwMTIwNiA1LjM3NjE1MWMuNjI3ODI4LS4wMDA0MTQgMS4yMjY4NzkuMjM2NTU3IDEuNjcwOTg3LjY2MDc4OWwxLjA4NDYzNy0xLjA1NzQ2N2MtMC43MzQwMTMtLjcxNDk2Ni0xLjcyNzIxNi0xLjExNzA5MS0yLjc1NTcyNC0xLjExNzA5MXMtMi4wMjE3MTEuNDAyMTI1LTIuNzU1NzI1IDEuMTE3MDkxbDEuMDg0NjM4IDEuMDU3NDY3Yy40NDM4MzQtLjQyMzk3IDEuMDQyNTQ0LS42NjA3ODkgMS42NzExODctLjY2MDc4OXptLTMuMzQwNzg4IDMuODMyNDQ2Yy0xLjAwMjI0NC45NzY1MTItMS4wMDIyNDQgMi41NTkzNjkgMCAzLjUzNTg4MXMghiI=',
};

const WalletProvider: React.FC<React.PropsWithChildren<{ config?: WalletKitConfig }>> = ({ children, config }) => {
  const { address: wagmiAddress, isConnected: wagmiIsConnected, isConnecting, chainId: wagmiChainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();

  // 错误状态
  const [error, setError] = React.useState<WalletError | undefined>(undefined);

  // WLT 钱包独立状态（不走 wagmi）
  const [wltAddress, setWltAddress] = React.useState<string | undefined>(undefined);
  const [wltChainId, setWltChainId] = React.useState<number | undefined>(undefined);

  // 合并 wagmi 和 WLT 的状态
  const address = (wagmiAddress || wltAddress) as `0x${string}` | undefined;
  const isConnected = wagmiIsConnected || !!wltAddress;
  const chainId = wagmiChainId || wltChainId;

  // 使用合并后的 address 查询余额
  // wagmi 的 useBalance 在切换钱包时可能返回缓存的旧数据
  // 所以用 direct RPC 查询确保余额正确
  const [balance, setBalance] = React.useState<string | undefined>(undefined);
  const publicClient = usePublicClient();

  React.useEffect(() => {
    console.log('[WalletKit Balance] useEffect triggered, address:', address, 'chainId:', chainId, 'publicClient:', !!publicClient, 'publicClient.chain?.id:', publicClient?.chain?.id);
    if (!address || !publicClient) {
      console.log('[WalletKit Balance] Missing address or publicClient, skipping');
      setBalance(undefined);
      return;
    }

    // 对于 WLT 钱包，必须等 chainId 可用后再查询余额
    // 因为 WLT 钱包的 chainId 是异步获取的，而 publicClient 默认是 mainnet
    // 如果 chainId 还没获取到，跳过本次查询（chainId 变化时会重新触发）
    if (!wltAddress && !chainId) {
      console.log('[WalletKit Balance] No chainId yet, skipping (will retry when chainId changes)');
      return;
    }
    // WLT 钱包连接时，如果 chainId 还没到，跳过
    if (wltAddress && !chainId) {
      console.log('[WalletKit Balance] WLT connected but chainId not ready yet, skipping');
      return;
    }

    let cancelled = false;

    const queryBalance = async () => {
      try {
        const targetChainId = chainId || publicClient.chain?.id;
        console.log('[WalletKit Balance] Querying balance for address:', address, 'targetChainId:', targetChainId, 'publicClient.chain?.id:', publicClient.chain?.id);

        let balanceWei: bigint;

        if (targetChainId && targetChainId !== publicClient.chain?.id && config?.rpcUrls?.[targetChainId]) {
          // 链不匹配且有自定义 RPC URL，直接 RPC 调用
          const rpcUrl = config.rpcUrls[targetChainId];
          console.log('[WalletKit Balance] Using direct RPC:', rpcUrl);
          const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [address, 'latest'],
              id: 1,
            }),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          balanceWei = BigInt(data.result);
        } else {
          // 使用 wagmi 的 publicClient（默认链）
          balanceWei = await publicClient.getBalance({
            address: address as `0x${string}`,
          });
        }

        if (!cancelled) {
          const ether = Number(balanceWei) / 1e18;
          console.log('[WalletKit Balance] Balance received:', balanceWei.toString(), 'wei =', ether, 'ETH');
          setBalance(ether.toString());
        }
      } catch (e: any) {
        console.warn('[WalletKit Balance] Failed to fetch balance:', e);
        if (!cancelled) setBalance(undefined);
      }
    };

    queryBalance();
    return () => { cancelled = true; };
  }, [address, publicClient, chainId, wltAddress]);

  // 合并钱包配置（只修改显示属性）
  const walletActions = React.useMemo(() => {
    return mergeWalletConfigs(config?.wallets);
  }, [config?.wallets]);

  // 计算钱包状态
  const status = React.useMemo<WalletStatus>(() => {
    if (error) return 'error';
    if (isPending || isConnecting) return 'connecting';
    if (isConnected && address) return 'connected';
    return 'disconnected';
  }, [error, isPending, isConnecting, isConnected, address]);

  const handleConnect = React.useCallback(async (connectorId: string) => {
    console.log('[WalletKit] handleConnect called with:', connectorId);
    setError(undefined);

    try {
      // WLT Wallet 直接使用 window.wltwallet，不走 wagmi 的 injected connector
      if (connectorId === 'wlt') {
        const wltProvider = (window as any).wltwallet;
        if (wltProvider && wltProvider.isWltWallet) {
          const result = await wltProvider.request({ method: 'eth_requestAccounts' });

          // 检查返回结果是否有错误
          if (result && typeof result === 'object' && result.error) {
            throw new Error(result.error);
          }

          const accounts = Array.isArray(result) ? result : [];

          if (accounts && accounts.length > 0) {
            console.log('[WalletKit] WLT Wallet connected:', accounts[0]);
            // 先更新地址状态，让 UI 立即响应
            setWltAddress(accounts[0]);
            // 异步获取 chainId（不阻塞连接流程）
            wltProvider.request({ method: 'eth_chainId' }).then((chainIdResult: any) => {
              if (chainIdResult) {
                console.log('[WalletKit] WLT chainId:', chainIdResult);
                setWltChainId(parseInt(chainIdResult, 16));
              }
            }).catch((e: any) => {
              console.warn('[WalletKit] Failed to get chainId:', e);
            });
          } else {
            throw new Error('未找到账户，请先在 WLT 钱包中创建或导入钱包');
          }
          return;
        } else {
          throw new Error('WLT Wallet 未安装或未初始化');
        }
      }

      let connector;

      // MetaMask 使用 injected connector
      if (connectorId === 'metamask') {
        connector = connectors.find(c => c.id === 'injected');
      } else {
        // 其他钱包通过 ID 查找
        const connectorIdMap: Record<string, string> = {
          'coinbase': 'coinbaseWalletSDK',
          'walletconnect': 'walletConnect',
        };
        const actualConnectorId = connectorIdMap[connectorId.toLowerCase()] || connectorId;
        connector = connectors.find(c =>
          c.id === actualConnectorId ||
          c.id === connectorId ||
          c.name.toLowerCase() === connectorId.toLowerCase()
        );
      }

      if (!connector) {
        throw new Error(`Connector not found: ${connectorId}. Available connectors: ${connectors.map(c => c.id).join(', ')}`);
      }

      connect({ connector });
    } catch (err: any) {
      const walletError: WalletError = {
        code: err?.code || -1,
        message: err?.message || 'Connection failed',
        data: err,
      };
      setError(walletError);
      throw err;
    }
  }, [connectors, connect]);

  const handleDisconnect = React.useCallback(() => {
    setError(undefined);
    setWltAddress(undefined);
    setWltChainId(undefined);
    disconnect();
  }, [disconnect]);

  const handleSwitchChain = React.useCallback((targetChainId: number) => {
    setError(undefined);
    switchChain({ chainId: targetChainId });
  }, [switchChain]);

  const handleSignMessage = React.useCallback(async (message: string): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    try {
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (err: any) {
      const walletError: WalletError = {
        code: err?.code || -1,
        message: err?.message || 'Sign message failed',
        data: err,
      };
      setError(walletError);
      throw err;
    }
  }, [address, signMessageAsync]);

  // 转换 connectors 格式
  const formattedConnectors = React.useMemo(() => {
    // 过滤掉通用的 'injected' connector，只保留具体的钱包
    const filteredConnectors = connectors.filter(c => c.id !== 'injected');
    return filteredConnectors.map(c => {
      // 先尝试精确匹配
      let iconKey = Object.keys(WALLET_ICONS).find(
        key => key.toLowerCase() === c.id.toLowerCase()
      );
      // 如果精确匹配失败，再尝试名称匹配
      if (!iconKey) {
        iconKey = Object.keys(WALLET_ICONS).find(
          key => key.toLowerCase() === c.name.toLowerCase().replace(/\s/g, '')
        );
      }
      return {
        id: c.id,
        name: c.name,
        icon: c.icon || (iconKey ? WALLET_ICONS[iconKey] : undefined),
      };
    });
  }, [connectors]);

  const value: WalletContextState = {
    address,
    isConnected,
    isConnecting: isPending || isConnecting,
    chainId,
    balance: balance,
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
    signMessage: handleSignMessage,
    connectors: formattedConnectors,
    walletActions,
    config,
    status,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export { WalletProvider };
export default WalletProvider;