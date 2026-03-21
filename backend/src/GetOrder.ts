import OrderDAO from "./OrderDAO";
import { isValidUUID } from "./validateUUID";

export default class GetOrder {
  constructor(readonly orderDAO: OrderDAO) {}

  async execute(orderId: string): Promise<any> {
    if (!isValidUUID(orderId)) throw new Error("Invalid order");

    const orderData = await this.orderDAO.selectOrder(orderId);

    if (!orderData)
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });

    const order = {
      orderId: orderData.order_id,
      marketId: orderData.market_id,
      accountId: orderData.account_id,
      side: orderData.side,
      quantity: parseFloat(orderData.quantity),
      price: parseFloat(orderData.price),
      status: orderData.status,
      timestamp: orderData.timestamp,
    };

    return order;
  }
}
