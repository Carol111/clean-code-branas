import OrderDAO from "./OrderDAO";

export default class GetDepth {
  constructor(readonly orderDAO: OrderDAO) {}

  roundToNearest(value: number, precision: number) {
    const divisor = Math.pow(10, precision);
    return Math.floor(value / divisor) * divisor;
  }

  async execute(marketId: string, precision: number): Promise<any> {
    if (!["BTC/USD", "USD/BTC"].includes(marketId))
      throw new Error("Invalid market");
    if (precision < 0) throw new Error("Invalid precision");

    const buyOrders = await this.orderDAO.selectOrders(
      marketId,
      "buy",
      undefined,
      "open",
    );

    const buyOrdersGrouped = buyOrders.reduce(
      (
        acc: { quantity: number; price: number }[],
        cur: { quantity: string; price: string },
      ) => {
        const roundedPrice = this.roundToNearest(
          parseFloat(cur.price),
          precision,
        );
        const samePrice = acc.find((value) => value.price === roundedPrice);
        if (!samePrice) {
          acc.push({ quantity: parseFloat(cur.quantity), price: roundedPrice });
        } else {
          samePrice.quantity = parseFloat(cur.quantity) + samePrice.quantity;
        }
        return acc;
      },
      [] as { quantity: number; price: number }[],
    );

    const buyOrdersSorted = buyOrdersGrouped.sort(
      (
        a: { quantity: number; price: number },
        b: { quantity: number; price: number },
      ) => b.price - a.price,
    );

    const sellOrders = await this.orderDAO.selectOrders(
      marketId,
      "sell",
      undefined,
      "open",
    );

    const sellOrdersGrouped = sellOrders.reduce(
      (
        acc: { quantity: number; price: number }[],
        cur: { quantity: string; price: string },
      ) => {
        const roundedPrice = this.roundToNearest(
          parseFloat(cur.price),
          precision,
        );
        const samePrice = acc.find((value) => value.price === roundedPrice);
        if (!samePrice) {
          acc.push({ quantity: parseFloat(cur.quantity), price: roundedPrice });
        } else {
          samePrice.quantity = parseFloat(cur.quantity) + samePrice.quantity;
        }
        return acc;
      },
      [] as { quantity: number; price: number }[],
    );

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
