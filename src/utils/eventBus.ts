type Handler = (...args: any[]) => void;

class EventBus {
  private handlers: Record<string, Handler[]> = {};

  on(event: string, fn: Handler) {
    (this.handlers[event] ||= []).push(fn);
  }

  off(event: string, fn: Handler) {
    this.handlers[event] = (this.handlers[event] || []).filter(h => h !== fn);
  }

  emit(event: string, ...args: any[]) {
    (this.handlers[event] || []).forEach(fn => fn(...args));
  }
}

const eventBus = new EventBus();
export default eventBus;
