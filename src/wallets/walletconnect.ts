import { BaseWalletAdapter } from './base';

export class WalletConnectAdapter extends BaseWalletAdapter {
  id = 'walletconnect';
  name = 'WalletConnect';
  provider: any | null = null;

  getProvider(): any | null {
    return this.provider;
  }

  async connect(onUri?: (uri: string) => void): Promise<string[]> {
    try {
      // some versions of @walletconnect expect Node globals in browser environments
      const runtimeGlobal: any = (() => {
        if (typeof globalThis !== 'undefined') return globalThis;
        if (typeof window !== 'undefined') return window;
        if (typeof self !== 'undefined') return self;
        return {};
      })();

      if (typeof runtimeGlobal.global === 'undefined') {
        runtimeGlobal.global = runtimeGlobal;
      }
      if (typeof runtimeGlobal.process === 'undefined') {
        runtimeGlobal.process = { env: {}, browser: true };
      } else if (typeof runtimeGlobal.process.browser === 'undefined') {
        runtimeGlobal.process.browser = true;
      }
      if (typeof runtimeGlobal.Buffer === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { Buffer } = await import('buffer');
        runtimeGlobal.Buffer = Buffer;
      }
      if (typeof runtimeGlobal.util === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const utilModule = await import('util');
        runtimeGlobal.util = utilModule;
      }
      if (typeof runtimeGlobal.util.inherits !== 'function') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        runtimeGlobal.util.inherits = runtimeGlobal.util.inherits || ((await import('util')).inherits);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const WCProvider = (await import('@walletconnect/web3-provider')).default;

      const rpcMap: Record<number, string> = {
        1: 'https://eth-mainnet.infura.io/v3/84842078b09946638c03157f83186060',
        11155111: 'https://eth-sepolia.infura.io/v3/84842078b09946638c03157f83186060',
        137: 'https://polygon-mainnet.infura.io/v3/84842078b09946638c03157f83186060',
        56: 'https://bsc-dataseed.binance.org:8545',
        43114: 'https://api.avax.network/ext/bc/C/rpc',
        42161: 'https://arb1.arbitrum.io/rpc',
      };

      const providerConfig: any = {
        infuraId: '84842078b09946638c03157f83186060',
        rpc: rpcMap,
        chainId: 1,
        qrcode: !Boolean(onUri),
      };

      if (onUri) {
        providerConfig.qrcodeModal = {
          // prevent default WalletConnect modal when using custom URI rendering
          open: (_uri: string, _cb: any) => {},
          close: () => {},
        };
      }

      const provider = new WCProvider(providerConfig);

      this.provider = provider;

      if (onUri && provider.connector && typeof provider.connector.on === 'function') {
        provider.connector.on('display_uri', (err: any, payload: any) => {
          if (err) return;
          const uri = payload?.params?.[0];
          if (typeof uri === 'string') {
            onUri(uri);
          }
        });
      }

      const accounts = await provider.enable();
      return Array.isArray(accounts) ? accounts : [];
    } catch (err: any) {
      // Clean up provider on error to prevent lingering WebSocket connections
      const originalMessage = err?.message || String(err);

      // Use timeout to prevent disconnect from hanging
      const disconnectWithTimeout = async () => {
        try {
          await Promise.race([
            this.disconnect(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('disconnect timeout')), 3000))
          ]);
        } catch (cleanupErr) {
          // Force clear provider even if disconnect fails
          this.provider = null;
        }
      };

      await disconnectWithTimeout();

      // Check if user closed the modal
      const isUserClosed =
        originalMessage.includes('User closed modal') ||
        originalMessage.includes('User rejected') ||
        originalMessage.includes('User canceled') ||
        originalMessage.includes('User cancelled') ||
        originalMessage.includes('User disapproved') ||
        originalMessage.toLowerCase().includes('user close') ||
        originalMessage.toLowerCase().includes('modal close');

      if (isUserClosed) {
        throw new Error('User closed modal');
      }

      throw new Error(
        `WalletConnect connection failed. Install with: npm install @walletconnect/web3-provider. Error: ${originalMessage}`
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this.provider) return;

    const provider = this.provider;

    // 先清除 provider 引用，防止其他地方继续使用
    this.provider = null;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const connector = provider.connector || provider.wc;

      if (connector) {
        // 1. 阻止后续 WebSocket 创建 - 替换 _socketCreate 方法使其不执行任何操作
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof connector._socketCreate === 'function') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          connector._socketCreate = () => {};
        }

        // 2. 标记为已关闭，阻止重连逻辑
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        connector._closed = true;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        connector.connected = false;

        // 3. 清除所有可能的定时器
        const timerProps = [
          '_heartbeatTimer',
          '_socketTimer',
          '_queueTimer',
          '_sessionTimer',
          '_pushTimer',
          'heartbeatTimer',
          'socketTimer',
          '_reconnectTimer',
          'reconnectTimer',
        ];
        for (const prop of timerProps) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (connector[prop]) {
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              clearTimeout(connector[prop]);
            } catch (e) {}
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              clearInterval(connector[prop]);
            } catch (e) {}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            connector[prop] = null;
          }
        }

        // 4. 清理 transport 并阻止其重连
        const transportProps = ['_transport', 'transport', 'socket', '_socket'];
        for (const prop of transportProps) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const transport = connector[prop];
          if (transport) {
            // 检查 transport 上是否有 _socketCreate
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (typeof transport._socketCreate === 'function') {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              transport._socketCreate = () => {};
            }

            try {
              if (typeof transport.off === 'function') transport.off();
            } catch (e) {}
            try {
              if (typeof transport.removeAllListeners === 'function') transport.removeAllListeners();
            } catch (e) {}
            try {
              if (typeof transport.close === 'function') transport.close();
            } catch (e) {}
            try {
              if (typeof transport.terminate === 'function') transport.terminate();
            } catch (e) {}
            try {
              if (typeof transport.destroy === 'function') transport.destroy();
            } catch (e) {}
            // 强制设为 null，阻止后续使用
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            connector[prop] = null;
          }
        }

        // 5. 移除所有事件监听器
        try {
          if (typeof connector.off === 'function') {
            connector.off('connect');
            connector.off('session_update');
            connector.off('disconnect');
            connector.off('display_uri');
            connector.off('heartbeat');
            connector.off('error');
            connector.off('message');
            connector.off('open');
            connector.off('close');
          }
        } catch (e) {}
        try {
          if (typeof connector.removeAllListeners === 'function') {
            connector.removeAllListeners();
          }
        } catch (e) {}

        // 6. 清空内部队列
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (connector._queue) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          connector._queue = [];
        }

        // 7. 调用 killSession（fire and forget）
        if (typeof connector.killSession === 'function') {
          try {
            connector.killSession().catch(() => {});
          } catch (e) {}
        }
      }

      // 8. 清理 provider
      try {
        if (typeof provider.removeAllListeners === 'function') {
          provider.removeAllListeners();
        }
      } catch (e) {}

    } catch (e) {
      // ignore cleanup errors
    }
  }
}

export default WalletConnectAdapter;