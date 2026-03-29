import Order from "./Order";

export function groupOrders(orders: Order[], precision: number) {
  const index: any = {
    buy: {},
    sell: {},
  };

  for (const order of orders) {
    const roundedPrice = order.price - (order.price % 10 ** precision);
    index[order.side][roundedPrice] = index[order.side][roundedPrice] || 0;
    index[order.side][roundedPrice] += order.quantity;
  }
  return index;
}
