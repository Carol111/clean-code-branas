import { groupOrders } from "../../domain/groupOrders";
import OrderRepository from "../../infra/repository/OrderRepository";

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

    const orders = await this.orderRepository.selectOrders(marketId, "open");

    const index = groupOrders(orders, precision);

    const output: Output = {
      buys: [],
      sells: [],
    };
    for (const price in index.buy) {
      output.buys.push({
        quantity: index.buy[price],
        price: parseFloat(price),
      });
    }
    for (const price in index.sell) {
      output.sells.push({
        quantity: index.sell[price],
        price: parseFloat(price),
      });
    }
    return output;
  }
}

type Output = {
  buys: { quantity: number; price: number }[];
  sells: { quantity: number; price: number }[];
};
