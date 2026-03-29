import Order from "../../domain/Order";
import DatabaseConnection from "../database/DatabaseConnection";

export default interface OrderRepository {
  selectOrders(
    marketId: string,
    status?: string,
    side?: string,
    accountId?: string,
  ): Promise<Order[]>;
  selectOrder(orderId: string): Promise<Order>;
  insertOrder(order: Order): Promise<void>;
}

export class OrderRepositoryDatabase implements OrderRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async selectOrders(
    marketId: string,
    status?: string,
    side?: string,
    accountId?: string,
  ) {
    const ids = [status, side, accountId];
    const query =
      "select * from ccca.order where market_id = $1" +
      (status ? " and status = $" + (ids.indexOf(status) + 2) : "") +
      (side ? " and side = $" + (ids.indexOf(side) + 2) : "") +
      (accountId ? " and account_id = $" + (ids.indexOf(accountId) + 2) : "");

    const params = [marketId]
      .concat(status ? [status] : [])
      .concat(side ? [side] : [])
      .concat(accountId ? [accountId] : []);

    const ordersData = await this.connection.query(query, params);

    const orders: Order[] = [];

    for (const orderData of ordersData) {
      orders.push(
        new Order(
          orderData.order_id,
          orderData.market_id,
          orderData.account_id,
          orderData.side,
          parseFloat(orderData.quantity),
          parseFloat(orderData.price),
          orderData.status,
          orderData.timestamp,
        ),
      );
    }

    return orders;
  }

  async selectOrder(orderId: string) {
    const [orderData] = await this.connection.query(
      "select * from ccca.order where order_id = $1",
      [orderId],
    );

    return new Order(
      orderData.order_id,
      orderData.market_id,
      orderData.account_id,
      orderData.side,
      parseFloat(orderData.quantity),
      parseFloat(orderData.price),
      orderData.status,
      orderData.timestamp,
    );
  }

  async insertOrder(order: Order) {
    await this.connection.query(
      "insert into ccca.order (order_id, market_id, account_id, side, quantity, price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        order.orderId,
        order.marketId,
        order.accountId,
        order.side,
        order.quantity,
        order.price,
        order.status,
        order.timestamp,
      ],
    );
  }
}
