import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import PlaceOrder from "../../src/PlaceOrder";
import GetOrder from "../../src/GetOrder";
import { AccountRepositoryDatabase } from "../../src/AccountRepository";
import { OrderDAODatabase } from "../../src/OrderDAO";
import orderEventEmitter from "../../src/OrderEventEmitter";

describe("Order", () => {
  let signup: Signup;
  let deposit: Deposit;
  let placeOrder: PlaceOrder;
  let getOrder: GetOrder;
  let accountId: string;

  beforeEach(async () => {
    const accountRepository = new AccountRepositoryDatabase();
    const orderDAO = new OrderDAODatabase();
    signup = new Signup(accountRepository);
    deposit = new Deposit(accountRepository);
    placeOrder = new PlaceOrder(accountRepository, orderDAO);
    getOrder = new GetOrder(orderDAO);

    const outputSignup = await signup.execute({
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    });

    accountId = outputSignup.accountId;

    await deposit.execute({ accountId, assetId: "BTC", quantity: 1 });
    await deposit.execute({ accountId, assetId: "USD", quantity: 100 });
  });

  afterEach(() => {
    orderEventEmitter.removeAllListeners();
  });

  test("Should create a sell order", async () => {
    const outputPlaceOrder = await placeOrder.execute(
      accountId,
      "BTC/USD",
      "sell",
      94000,
      1,
    );

    expect(outputPlaceOrder.orderId).toBeDefined();

    const outputGetOrder = await getOrder.execute(outputPlaceOrder.orderId);

    expect(outputGetOrder.marketId).toBe("BTC/USD");
    expect(outputGetOrder.side).toBe("sell");
    expect(outputGetOrder.quantity).toBe(1);
    expect(outputGetOrder.price).toBe(94000);
    expect(outputGetOrder.status).toBe("open");
    expect(outputGetOrder.timestamp).toBeDefined();
  });

  test("Should create a buy order", async () => {
    const outputPlaceOrder = await placeOrder.execute(
      accountId,
      "BTC/USD",
      "buy",
      94,
      0.001,
    );
    expect(outputPlaceOrder.orderId).toBeDefined();

    const outputGetOrder = await getOrder.execute(outputPlaceOrder.orderId);

    expect(outputGetOrder.marketId).toBe("BTC/USD");
    expect(outputGetOrder.side).toBe("buy");
    expect(outputGetOrder.quantity).toBe(0.001);
    expect(outputGetOrder.price).toBe(94);
    expect(outputGetOrder.status).toBe("open");
    expect(outputGetOrder.timestamp).toBeDefined();
  });

  test("Should not create sell order when balance is insufficient", async () => {
    await expect(() =>
      placeOrder.execute(accountId, "BTC/USD", "sell", 94000, 2),
    ).rejects.toThrow("Insufficient amount for this order");
  });

  test("Should not create sell order when balance is already reserved", async () => {
    await placeOrder.execute(accountId, "BTC/USD", "sell", 94000, 1);

    await expect(() =>
      placeOrder.execute(accountId, "BTC/USD", "sell", 94000, 1),
    ).rejects.toThrow("Insufficient amount for this order");
  });

  test.each([
    {
      marketId: "USD/USD",
      side: "sell",
      quantity: 1,
      price: 1,
      error: "Invalid order",
    },
    {
      marketId: "BTC/USD",
      side: "negociate",
      quantity: 1,
      price: 1,
      error: "Invalid order",
    },
    {
      marketId: "BTC/USD",
      side: "sell",
      quantity: -1,
      price: 1,
      error: "Invalid quantity",
    },
    {
      marketId: "BTC/USD",
      side: "sell",
      quantity: 1,
      price: -1,
      error: "Invalid price",
    },
  ])(
    "Should not create order with invalid data",
    async (order: {
      marketId: string;
      side: string;
      quantity: number;
      price: number;
      error: string;
    }) => {
      await expect(() =>
        placeOrder.execute(
          accountId,
          order.marketId,
          order.side,
          order.price,
          order.quantity,
        ),
      ).rejects.toThrow(order.error);
    },
  );

  test("Should emit orderCreated event after order is placed", async () => {
    let eventPayload: any = null;
    orderEventEmitter.on("orderCreated", (order) => {
      eventPayload = order;
    });

    await placeOrder.execute(accountId, "BTC/USD", "sell", 94000, 1);

    expect(eventPayload).not.toBeNull();
    expect(eventPayload).toEqual(
      expect.objectContaining({
        marketId: "BTC/USD",
        side: "sell",
        quantity: 1,
        price: 94000,
        status: "open",
      }),
    );
  });

  test("Should not emit event if order creation fails", async () => {
    let eventPayload: any = null;
    orderEventEmitter.on("orderCreated", (order) => {
      eventPayload = order;
    });

    try {
      await placeOrder.execute(accountId, "BTC/USD", "sell", 94000, 2);
    } catch (error) {}

    expect(eventPayload).toBeNull();
  });
});
