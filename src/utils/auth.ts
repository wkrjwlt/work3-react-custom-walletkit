/**
 * 签名验证工具
 * 用于实现安全的钱包登录机制
 */

/**
 * 生成随机 nonce
 * @param length nonce 长度（默认 32）
 * @returns 随机字符串
 */
export function generateNonce(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 创建登录消息
 * @param nonce 随机 nonce
 * @param appName 应用名称
 * @returns 要签名的消息
 */
export function createLoginMessage(nonce: string, appName: string = 'DApp'): string {
  return `Welcome to ${appName}!

Please sign this message to verify your identity.

Nonce: ${nonce}

This signature will be used to authenticate your wallet.`;
}

/**
 * 验证签名
 * @param message 原始消息
 * @param signature 签名
 * @param address 钱包地址
 * @returns 验证是否通过
 */
export async function verifySignature(params: {
  message: string;
  signature: string;
  address: string;
}): Promise<boolean> {
  try {
    const { message, signature, address } = params;

    // 使用 viem 或 ethers 验证签名
    // 这里需要根据实际使用的库来实现
    // 示例使用 viem
    const { verifyMessage } = await import('viem');

    const isValid = await verifyMessage({
      message,
      signature: signature as `0x${string}`,
      address: address as `0x${string}`,
    });

    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * 简化版签名验证（不依赖 viem）
 * 仅用于演示，生产环境请使用完整的库验证
 */
export function verifySignatureSimple(params: {
  message: string;
  signature: string;
  address: string;
}): boolean {
  // 注意：这是一个简化的实现
  // 生产环境应该使用专业的加密库进行验证
  console.warn('Using simplified signature verification. Use verifySignature for production.');
  return params.signature && params.address ? true : false;
}

/**
 * JWT Token 创建（简化版）
 * 注意：生产环境应该在服务器端创建 JWT
 */
export function createJWT(payload: any): string {
  // 这里应该使用真实的 JWT 库（如 jsonwebtoken）
  // 为了演示，我们返回一个简单的 token
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 3600000, // 1小时过期
  }));
  const signature = btoa(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

/**
 * JWT Token 验证（简化版）
 */
export function verifyJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // 检查是否过期
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 钱包登录流程
 * @param walletAdapter 钱包适配器
 * @param appName 应用名称
 * @returns JWT Token
 */
export async function walletLogin(
  walletAdapter: {
    signMessage: (message: string) => Promise<string>;
    getProvider: () => any;
  },
  appName: string = 'DApp'
): Promise<string> {
  // 1. 生成 nonce
  const nonce = generateNonce();

  // 2. 创建登录消息
  const message = createLoginMessage(nonce, appName);

  // 3. 请求签名
  const signature = await walletAdapter.signMessage(message);

  // 4. 获取账户地址
  const provider = walletAdapter.getProvider();
  const accounts = await provider.request({ method: 'eth_accounts' });
  const address = accounts[0];

  // 5. 验证签名（可选，生产环境应该在服务器端验证）
  const isValid = await verifySignature({
    message,
    signature,
    address,
  });

  if (!isValid) {
    throw new Error('Signature verification failed');
  }

  // 6. 创建 JWT Token（生产环境应该在服务器端创建）
  const token = createJWT({
    address,
    nonce,
    signature,
  });

  return token;
}