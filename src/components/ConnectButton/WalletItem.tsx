import React from 'react';

export const WalletItem: React.FC<{ id: string; name: string; icon?: string }> = ({ id, name }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: 8 }}>
      <div style={{ width: 32, height: 32, background: '#eee', borderRadius: 6, marginRight: 8 }} />
      <div>{name}</div>
    </div>
  );
};

export default WalletItem;
