import { EventEmitter } from "events";

export interface OrderEvent {
  orderId: string;
  accountId: string;
  marketId: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  timestamp: Date;
}

class OrderEventEmitterSingleton extends EventEmitter {
  private static instance: OrderEventEmitterSingleton;

  private constructor() {
    super();
    this.setMaxListeners(10);
  }

  static getInstance(): OrderEventEmitterSingleton {
    if (!OrderEventEmitterSingleton.instance) {
      OrderEventEmitterSingleton.instance = new OrderEventEmitterSingleton();
    }
    return OrderEventEmitterSingleton.instance;
  }

  emitOrderCreated(order: OrderEvent): void {
    this.emit("orderCreated", order);
  }

  onOrderCreated(callback: (order: OrderEvent) => void): void {
    this.on("orderCreated", callback);
  }

  removeOrderCreatedListener(callback: (order: OrderEvent) => void): void {
    this.removeListener("orderCreated", callback);
  }
}

export default OrderEventEmitterSingleton.getInstance();
