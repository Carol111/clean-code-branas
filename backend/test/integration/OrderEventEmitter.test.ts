import orderEventEmitter from "../../src/application/event/OrderEventEmitter";

import Signup from "../../src/application/usecase/Signup";
import Deposit from "../../src/application/usecase/Deposit";
import PlaceOrder from "../../src/application/usecase/PlaceOrder";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { OrderRepositoryDatabase } from "../../src/infra/repository/OrderRepository";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";

describe("OrderEventEmitter", () => {
  let signup: Signup;
  let deposit: Deposit;
  let placeOrder: PlaceOrder;
  let accountId: string;

  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = new PgPromiseAdapter(process.env.DATABASE_TEST_URL!);
    await connection.query("BEGIN");

    const accountRepository = new AccountRepositoryDatabase(connection);
    const orderRepository = new OrderRepositoryDatabase(connection);
    signup = new Signup(accountRepository);
    deposit = new Deposit(accountRepository);
    placeOrder = new PlaceOrder(accountRepository, orderRepository);

    const outputSignup = await signup.execute({
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    });

    accountId = outputSignup.accountId;

    await deposit.execute({ accountId, assetId: "BTC", quantity: 10 });
  });

  test("Should emit orderCreated event", async () => {
    orderEventEmitter.onOrderCreated((order) => {
      expect(order.accountId).toBe(accountId);
      expect(order.marketId).toBe("BTC/USD");
      expect(order.side).toBe("sell");
      expect(order.quantity).toBe(1);
      expect(order.price).toBe(84000);
    });

    await placeOrder.execute({
      accountId,
      marketId: "BTC/USD",
      side: "sell",
      price: 84000,
      quantity: 1,
    });
  });

  test("Should be singleton - same instance", () => {
    const emitter1 = orderEventEmitter;
    const emitter2 = orderEventEmitter;

    expect(emitter1).toBe(emitter2);
  });

  test("Should handle multiple listeners", async () => {
    let count = 0;

    const listener1 = () => count++;
    const listener2 = () => count++;

    orderEventEmitter.onOrderCreated(listener1);
    orderEventEmitter.onOrderCreated(listener2);

    await placeOrder.execute({
      accountId,
      marketId: "BTC/USD",
      side: "sell",
      price: 84000,
      quantity: 1,
    });

    expect(count).toBe(2);
  });

  test("Should remove listener", async () => {
    let callCount = 0;
    const listener = () => callCount++;

    orderEventEmitter.onOrderCreated(listener);
    orderEventEmitter.removeOrderCreatedListener(listener);

    await placeOrder.execute({
      accountId,
      marketId: "BTC/USD",
      side: "sell",
      price: 84000,
      quantity: 1,
    });

    expect(callCount).toBe(0);
  });

  afterEach(async () => {
    orderEventEmitter.removeAllListeners();
    await connection.query("ROLLBACK");
    await connection.close();
  });
});
