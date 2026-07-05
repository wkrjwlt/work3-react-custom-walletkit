import React from 'react';

export const WalletItem: React.FC<{
  id: string;
  name: string;
  icon?: string;
  onClick?: (id: string) => void;
}> = ({ id, name, icon, onClick }) => {
  return (
    <button
      onClick={() => onClick && onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 8,
        width: '100%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ width: 32, height: 32, marginRight: 8 }}>
        {icon ? (
          // use img tag to load svg asset paths
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <img src={icon} alt={`${name} logo`} style={{ width: 32, height: 32 }} />
        ) : (
          <div style={{ width: 32, height: 32, background: '#eee', borderRadius: 6 }} />
        )}
      </div>
      <div>{name}</div>
    </button>
  );
};

export default WalletItem;
