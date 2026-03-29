import OrderRepository from "./OrderRepository";
import { isValidUUID } from "./validateUUID";

export default class GetOrder {
  constructor(readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<any> {
    if (!isValidUUID(orderId)) throw new Error("Invalid order");

    const orderData = await this.orderRepository.selectOrder(orderId);

    if (!orderData)
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });

    const order = {
      orderId: orderData.orderId,
      marketId: orderData.marketId,
      accountId: orderData.accountId,
      side: orderData.side,
      quantity: orderData.quantity,
      price: orderData.price,
      status: orderData.status,
      timestamp: orderData.timestamp,
    };

    return order;
  }
}
