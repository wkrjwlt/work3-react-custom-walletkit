export function truncateAddress(addr?: string) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export function formatEther(value: string | number) {
  return String(value);
}

export default { truncateAddress, formatEther };
