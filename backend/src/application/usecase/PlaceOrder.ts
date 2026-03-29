import crypto from "crypto";
import AccountRepository from "../../infra/repository/AccountRepository";
import OrderRepository from "../../infra/repository/OrderRepository";
import { isValidUUID } from "../../domain/validateUUID";
import orderEventEmitter from "../event/OrderEventEmitter";
import Order from "../../domain/Order";

export default class PlaceOrder {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    if (!isValidUUID(input.accountId)) throw new Error("Invalid account");

    const accountData = await this.accountRepository.selectAccount(
      input.accountId,
    );

    if (!accountData) throw new Error("Invalid account");
    if (!["BTC/USD", "USD/BTC"].includes(input.marketId))
      throw new Error("Invalid order");
    if (!["sell", "buy"].includes(input.side)) throw new Error("Invalid order");
    if (input.quantity <= 0) throw new Error("Invalid quantity");
    if (input.price <= 0) throw new Error("Invalid price");

    const assetsId = input.marketId.split("/");
    const assetId = input.side === "sell" ? assetsId[0] : assetsId[1];

    const accountAssetData = await this.accountRepository.selectAccountAsset(
      input.accountId,
      assetId,
    );

    if (!accountAssetData) throw new Error("No funds available for this order");

    if (
      input.side === "sell"
        ? accountAssetData.getQuantity() < input.quantity
        : accountAssetData.getQuantity() < input.price
    )
      throw new Error("Insufficient amount for this order");

    const ordersData = await this.orderRepository.selectOrders(
      input.marketId,
      input.side,
      input.accountId,
      "open",
    );

    let totalAmout = 0;
    for (const orderData of ordersData) {
      totalAmout +=
        input.side === "sell" ? orderData.quantity : orderData.price;
    }

    if (
      input.side === "sell"
        ? accountAssetData.getQuantity() < input.quantity + totalAmout
        : accountAssetData.getQuantity() < input.price + totalAmout
    )
      throw new Error("Insufficient amount for this order");

    const order = Order.create(
      input.marketId,
      input.accountId,
      input.side,
      input.quantity,
      input.price,
    );

    await this.orderRepository.insertOrder(order);

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

type Input = {
  marketId: string;
  accountId: string;
  side: string;
  quantity: number;
  price: number;
};

type Output = {
  orderId: string;
};
