import { groupOrders } from "../../src/domain/groupOrders";
import Order from "../../src/domain/Order";

test("Deve agrupar as ordens", () => {
  const orders = [
    Order.create("", "", "sell", 1, 94000),
    Order.create("", "", "sell", 1, 94000),
    Order.create("", "", "sell", 1, 94000),
  ];
  const index = groupOrders(orders, 0);
  expect(index.sell[94000]).toBe(3);
});

test("Deve agrupar as ordens", () => {
  const orders = [
    Order.create("", "", "sell", 1, 94000),
    Order.create("", "", "sell", 1, 94500),
    Order.create("", "", "sell", 1, 94600),
  ];
  const index = groupOrders(orders, 3);
  expect(index.sell[94000]).toBe(3);
});

test("Deve agrupar as ordens", () => {
  const orders = [
    Order.create("", "", "sell", 1, 94000),
    Order.create("", "", "sell", 1, 94500),
    Order.create("", "", "sell", 1, 94600),
  ];
  const index = groupOrders(orders, 0);
  expect(index.sell[94000]).toBe(1);
  expect(index.sell[94500]).toBe(1);
  expect(index.sell[94600]).toBe(1);
});
