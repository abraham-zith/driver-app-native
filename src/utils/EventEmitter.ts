type Listener = (data: any) => void;

class GlobalEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== callback);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(l => l(data));
  }
}

export const globalEmitter = new GlobalEmitter();

export const EVENTS = {
  TRIP_CANCELLED: 'TRIP_CANCELLED',
};
