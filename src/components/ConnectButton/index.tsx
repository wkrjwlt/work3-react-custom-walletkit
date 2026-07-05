import React, { useState } from 'react';
import Modal from './Modal';

export const ConnectButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Connect Wallet</button>
      <Modal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ConnectButton;
