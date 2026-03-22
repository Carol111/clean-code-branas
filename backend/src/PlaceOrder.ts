import crypto from "crypto";
import AccountDAO from "./AccountDAO";
import OrderDAO from "./OrderDAO";
import { isValidUUID } from "./validateUUID";
import orderEventEmitter from "./OrderEventEmitter";

export default class PlaceOrder {
  constructor(
    readonly accountDAO: AccountDAO,
    readonly orderDAO: OrderDAO,
  ) {}

  async execute(
    accountId: string,
    marketId: string,
    side: string,
    price: number,
    quantity: number,
  ): Promise<any> {
    if (!isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountDAO.selectAccount(accountId);

    if (!accountData) throw new Error("Invalid account");
    if (!["BTC/USD", "USD/BTC"].includes(marketId))
      throw new Error("Invalid order");
    if (!["sell", "buy"].includes(side)) throw new Error("Invalid order");
    if (quantity <= 0) throw new Error("Invalid quantity");
    if (price <= 0) throw new Error("Invalid price");

    const assetsId = marketId.split("/");
    const assetId = side === "sell" ? assetsId[0] : assetsId[1];

    const accountAssetData = await this.accountDAO.selectAccountAsset(
      accountId,
      assetId,
    );

    if (!accountAssetData) throw new Error("No funds available for this order");

    if (
      side === "sell"
        ? parseFloat(accountAssetData.quantity) < quantity
        : parseFloat(accountAssetData.quantity) < price
    )
      throw new Error("Insufficient amount for this order");

    const ordersData = await this.orderDAO.selectOrders(
      marketId,
      side,
      accountId,
    );

    let totalAmout = 0;
    for (const orderData of ordersData) {
      totalAmout +=
        side === "sell"
          ? parseFloat(orderData.quantity)
          : parseFloat(orderData.price);
    }

    if (
      side === "sell"
        ? parseFloat(accountAssetData.quantity) < quantity + totalAmout
        : parseFloat(accountAssetData.quantity) < price + totalAmout
    )
      throw new Error("Insufficient amount for this order");

    const order = {
      orderId: crypto.randomUUID(),
      marketId: marketId,
      accountId: accountId,
      side: side,
      quantity: quantity,
      price: price,
      status: "open",
      timestamp: new Date(),
    };

    await this.orderDAO.insertOrder(order);

    orderEventEmitter.emitOrderCreated({
      orderId: order.orderId,
      accountId: order.accountId,
      marketId: order.marketId,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      timestamp: order.timestamp,
    });

    return {
      orderId: order.orderId,
    };
  }
}
