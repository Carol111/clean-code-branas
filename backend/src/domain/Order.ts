export default class Order {
  constructor(
    readonly orderId: string,
    readonly marketId: string,
    readonly accountId: string,
    readonly side: string,
    readonly quantity: number,
    readonly price: number,
    readonly status: string,
    readonly timestamp: Date,
  ) {}

  static create(
    marketId: string,
    accountId: string,
    side: string,
    quantity: number,
    price: number,
  ) {
    const orderId = crypto.randomUUID();
    const status = "open";
    const timestamp = new Date();
    return new Order(
      orderId,
      marketId,
      accountId,
      side,
      quantity,
      price,
      status,
      timestamp,
    );
  }
}
