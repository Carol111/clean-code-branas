import Signup from "../../src/application/usecase/Signup";
import Deposit from "../../src/application/usecase/Deposit";
import PlaceOrder from "../../src/application/usecase/PlaceOrder";
import GetDepth from "../../src/application/usecase/GetDepth";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { OrderRepositoryDatabase } from "../../src/infra/repository/OrderRepository";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";

describe("Depth", () => {
  let signup: Signup;
  let deposit: Deposit;
  let placeOrder: PlaceOrder;
  let getDepth: GetDepth;
  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = new PgPromiseAdapter(process.env.DATABASE_TEST_URL!);
    await connection.query("BEGIN");

    const accountRepository = new AccountRepositoryDatabase(connection);
    const orderRepository = new OrderRepositoryDatabase(connection);
    signup = new Signup(accountRepository);
    deposit = new Deposit(accountRepository);
    placeOrder = new PlaceOrder(accountRepository, orderRepository);
    getDepth = new GetDepth(orderRepository);
  });

  test("Should get market depth", async () => {
    const outputSignup1 = await signup.execute({
      name: "John Doe BTC",
      email: "john.doe.btc@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    });
    const accountId1 = outputSignup1.accountId;

    await deposit.execute({
      accountId: accountId1,
      assetId: "BTC",
      quantity: 10,
    });

    await placeOrder.execute({
      accountId: accountId1,
      marketId: "BTC/USD",
      side: "sell",
      price: 84500,
      quantity: 2,
    });
    await placeOrder.execute({
      accountId: accountId1,
      marketId: "BTC/USD",
      side: "sell",
      price: 87500,
      quantity: 4,
    });
    await placeOrder.execute({
      accountId: accountId1,
      marketId: "BTC/USD",
      side: "sell",
      price: 84600,
      quantity: 1,
    });
    await placeOrder.execute({
      accountId: accountId1,
      marketId: "BTC/USD",
      side: "sell",
      price: 88000,
      quantity: 1,
    });

    const outputSignup2 = await signup.execute({
      name: "John Doe USD",
      email: "john.doe.usd@gmail.com",
      document: "97456321558",
      password: "asdQWE124",
    });
    const accountId2 = outputSignup2.accountId;

    await deposit.execute({
      accountId: accountId2,
      assetId: "USD",
      quantity: 1000000,
    });
    await placeOrder.execute({
      accountId: accountId2,
      marketId: "BTC/USD",
      side: "buy",
      price: 82150,
      quantity: 1,
    });
    await placeOrder.execute({
      accountId: accountId2,
      marketId: "BTC/USD",
      side: "buy",
      price: 84150,
      quantity: 2,
    });
    await placeOrder.execute({
      accountId: accountId2,
      marketId: "BTC/USD",
      side: "buy",
      price: 82850,
      quantity: 2,
    });

    const outputGetDepthBTC = await getDepth.execute("BTC/USD", 3);
    expect(outputGetDepthBTC.sells.length).toBe(3);
    expect(outputGetDepthBTC.sells[0].price).toBe(84000);
    expect(outputGetDepthBTC.sells[1].price).toBe(87000);
    expect(outputGetDepthBTC.sells[2].price).toBe(88000);
    expect(outputGetDepthBTC.buys.length).toBe(2);
    expect(outputGetDepthBTC.buys[0].price).toBe(82000);
    expect(outputGetDepthBTC.buys[1].price).toBe(84000);
  });

  test.each([
    { marketId: "BCD/UVW", precision: 3, error: "Invalid market" },
    { marketId: "BTC/USD", precision: -3, error: "Invalid precision" },
  ])(
    "Should not get market depth",
    async (depth: { marketId: string; precision: number; error: string }) => {
      await expect(() =>
        getDepth.execute(depth.marketId, depth.precision),
      ).rejects.toThrow(depth.error);
    },
  );

  afterEach(async () => {
    await connection.query("ROLLBACK");
    await connection.close();
  });
});
