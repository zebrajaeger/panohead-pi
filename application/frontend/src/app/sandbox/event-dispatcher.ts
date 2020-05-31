export interface EventCallback<T> {
  (T);
}

export class EventChannel<T> {
  private eventName: string;
  private callbacks: EventCallback<T>[];

  constructor(eventName: string) {
    this.eventName = eventName;
    this.callbacks = [];
  }

  registerCallback(callback) {
    this.callbacks.push(callback);
  }

  unregisterCallback(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  fire(data) {
    const callbacks = this.callbacks.slice(0);
    callbacks.forEach((callback) => {
      callback(data);
    });
  }
}

export class Dispatcher {
  private channels: {};

  constructor() {
    this.channels = {};
  }

  dispatch(name, data) {
    const event = this.channels[name];
    if (event) {
      event.fire(data);
    }
  }

  on(name, callback) {
    let channel = this.channels[name];
    if (!channel) {
      channel = new EventChannel(name);
      this.channels[name] = channel;
    }
    channel.registerCallback(callback);
  }

  off(name, callback) {
    const channel = this.channels[name];
    if (channel && channel.callbacks.indexOf(callback) > -1) {
      channel.unregisterCallback(callback);
      if (channel.callbacks.length === 0) {
        delete this.channels[name];
      }
    }
  }
}
