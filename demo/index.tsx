import React from 'react';
import { createRoot } from 'react-dom/client';
import { WalletProvider } from '../src/provider/WalletProvider';
import ConnectButton from '../src/components/ConnectButton';

function App() {
  return (
    <WalletProvider>
      <div style={{ padding: 24 }}>
        <h1>Demo</h1>
        <ConnectButton showBalance />
      </div>
    </WalletProvider>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
