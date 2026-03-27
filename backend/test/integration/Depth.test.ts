import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import PlaceOrder from "../../src/PlaceOrder";
import GetDepth from "../../src/GetDepth";
import { AccountRepositoryDatabase } from "../../src/AccountRepository";
import { OrderDAODatabase } from "../../src/OrderDAO";

describe("Depth", () => {
  let signup: Signup;
  let deposit: Deposit;
  let placeOrder: PlaceOrder;
  let getDepth: GetDepth;

  beforeEach(() => {
    const accountRepository = new AccountRepositoryDatabase();
    const orderDAO = new OrderDAODatabase();
    signup = new Signup(accountRepository);
    deposit = new Deposit(accountRepository);
    placeOrder = new PlaceOrder(accountRepository, orderDAO);
    getDepth = new GetDepth(orderDAO);
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

    await placeOrder.execute(accountId1, "BTC/USD", "sell", 84500, 2);
    await placeOrder.execute(accountId1, "BTC/USD", "sell", 87500, 4);
    await placeOrder.execute(accountId1, "BTC/USD", "sell", 84600, 1);
    await placeOrder.execute(accountId1, "BTC/USD", "sell", 88000, 1);

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
    await placeOrder.execute(accountId2, "BTC/USD", "buy", 82150, 1);
    await placeOrder.execute(accountId2, "BTC/USD", "buy", 84150, 2);
    await placeOrder.execute(accountId2, "BTC/USD", "buy", 82850, 2);

    const outputGetDepthBTC = await getDepth.execute("BTC/USD", 3);
    expect(outputGetDepthBTC.sells.length).toBe(3);
    expect(outputGetDepthBTC.buys.length).toBe(2);
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
});
