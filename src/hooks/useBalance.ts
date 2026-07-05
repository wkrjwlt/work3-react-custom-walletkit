import { useEffect, useState } from 'react';

export function useBalance(address?: string) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    // placeholder: fetch balance via RPC
    setBalance('0');
  }, [address]);

  return { balance };
}

export default useBalance;
