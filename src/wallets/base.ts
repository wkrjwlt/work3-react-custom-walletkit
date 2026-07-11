/**
 * 钱包基础抽象类
 * 所有钱包适配器都必须实现这个接口
 */
export abstract class BaseWalletAdapter {
  /** 钱包唯一标识 */
  abstract id: string;

  /** 钱包显示名称 */
  abstract name: string;

  /** 钱包图标 */
  icon?: string;

  /** 钱包提供者实例 */
  protected provider: any = null;

  /**
   * 连接钱包
   * @returns 返回账户地址列表
   */
  abstract connect(onUri?: (uri: string) => void): Promise<string[]>;

  /**
   * 断开钱包连接
   */
  abstract disconnect(): Promise<void>;

  /**
   * 获取钱包提供者
   */
  abstract getProvider(): any | null;

  /**
   * 切换链
   * @param chainId 目标链 ID
   */
  async switchChain(chainId: number): Promise<void> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    try {
      // 尝试使用 wallet_switchEthereumChain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // 如果链不存在，尝试添加链
      if (switchError.code === 4902) {
        throw new Error('Chain not added to wallet. Please add it first.');
      }
      throw switchError;
    }
  }

  /**
   * 签名消息
   * @param message 要签名的消息
   * @returns 签名结果
   */
  async signMessage(message: string): Promise<string> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    const accounts = await provider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }

    return await provider.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    });
  }

  /**
   * 签名_TYPED_DATA（EIP-712）
   * @param typedData 类型化数据
   * @returns 签名结果
   */
  async signTypedData(typedData: any): Promise<string> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    const accounts = await provider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }

    return await provider.request({
      method: 'eth_signTypedData_v4',
      params: [accounts[0], JSON.stringify(typedData)],
    });
  }

  /**
   * 发送交易
   * @param transaction 交易对象
   * @returns 交易哈希
   */
  async sendTransaction(transaction: any): Promise<string> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    return await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    });
  }

  /**
   * 获取当前链 ID
   * @returns 链 ID
   */
  async getChainId(): Promise<number> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    const chainId = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  }

  /**
   * 获取账户余额
   * @param address 账户地址
   * @returns 余额（十六进制字符串）
   */
  async getBalance(address: string): Promise<string> {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    return await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
  }

  /**
   * 监听事件
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: (...args: any[]) => void): void {
    const provider = this.getProvider();
    if (provider && typeof provider.on === 'function') {
      provider.on(eventName, callback);
    }
  }

  /**
   * 移除事件监听
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  off(eventName: string, callback?: (...args: any[]) => void): void {
    const provider = this.getProvider();
    if (provider) {
      if (callback && typeof provider.removeListener === 'function') {
        provider.removeListener(eventName, callback);
      } else if (typeof provider.off === 'function') {
        provider.off(eventName, callback);
      }
    }
  }
}
