import { useEffect } from 'react';
import eventBus from '../utils/eventBus';

export function useWalletEvent(event: string, handler: (...args: any[]) => void) {
  useEffect(() => {
    eventBus.on(event, handler);
    return () => {
      eventBus.off(event, handler);
    };
  }, [event, handler]);
}

export default useWalletEvent;
