import Order from "./Order";
import OrderRepository from "./OrderRepository";

export default class GetDepth {
  constructor(readonly orderRepository: OrderRepository) {}

  roundToNearest(value: number, precision: number) {
    const divisor = Math.pow(10, precision);
    return Math.floor(value / divisor) * divisor;
  }

  async execute(marketId: string, precision: number): Promise<any> {
    if (!["BTC/USD", "USD/BTC"].includes(marketId))
      throw new Error("Invalid market");
    if (precision < 0) throw new Error("Invalid precision");

    const buyOrders = await this.orderRepository.selectOrders(
      marketId,
      "buy",
      undefined,
      "open",
    );

    const buyOrdersGrouped: { quantity: number; price: number }[] = [];

    for (const buyOrder of buyOrders) {
      const roundedPrice = this.roundToNearest(buyOrder.price, precision);
      const samePrice = buyOrdersGrouped.find(
        (value) => value.price === roundedPrice,
      );
      if (!samePrice) {
        buyOrdersGrouped.push({
          quantity: buyOrder.quantity,
          price: roundedPrice,
        });
      } else {
        samePrice.quantity = buyOrder.quantity + samePrice.quantity;
      }
    }

    const buyOrdersSorted = buyOrdersGrouped.sort(
      (
        a: { quantity: number; price: number },
        b: { quantity: number; price: number },
      ) => b.price - a.price,
    );

    const sellOrders = await this.orderRepository.selectOrders(
      marketId,
      "sell",
      undefined,
      "open",
    );

    const sellOrdersGrouped: { quantity: number; price: number }[] = [];

    for (const sellOrder of sellOrders) {
      const roundedPrice = this.roundToNearest(sellOrder.price, precision);
      const samePrice = sellOrdersGrouped.find(
        (value) => value.price === roundedPrice,
      );
      if (!samePrice) {
        sellOrdersGrouped.push({
          quantity: sellOrder.quantity,
          price: roundedPrice,
        });
      } else {
        samePrice.quantity = sellOrder.quantity + samePrice.quantity;
      }
    }

    const sellOrdersSorted = sellOrdersGrouped.sort(
      (
        a: { quantity: number; price: number },
        b: { quantity: number; price: number },
      ) => b.price - a.price,
    );

    return {
      buys: buyOrdersSorted,
      sells: sellOrdersSorted,
    };
  }
}
