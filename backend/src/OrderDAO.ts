import pgp from "pg-promise";

export default interface OrderDAO {
  selectOrders(accountId: string, marketId: string, side: string): Promise<any>;
  selectOrder(orderId: string): Promise<any>;
  insertOrder(order: any): Promise<any>;
}

export class OrderDAODatabase implements OrderDAO {
  async selectOrders(accountId: string, marketId: string, side: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const ordersData = await connection.query(
      "select * from ccca.order where account_id = $1 and market_id = $2 and side = $3",
      [accountId, marketId, side],
    );
    await connection.$pool.end();
    return ordersData;
  }

  async selectOrder(orderId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [orderData] = await connection.query(
      "select * from ccca.order where order_id = $1",
      [orderId],
    );
    await connection.$pool.end();
    return orderData;
  }

  async insertOrder(order: any) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
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
    await connection.$pool.end();
  }
}
