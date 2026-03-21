import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import PlaceOrder from "../../src/PlaceOrder";
import GetDepth from "../../src/GetDepth";
import { AccountDAODatabase } from "../../src/AccountDAO";
import { OrderDAODatabase } from "../../src/OrderDAO";

let signup: Signup;
let deposit: Deposit;
let placeOrder: PlaceOrder;
let getDepth: GetDepth;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  const orderDAO = new OrderDAODatabase();
  signup = new Signup(accountDAO);
  deposit = new Deposit(accountDAO);
  placeOrder = new PlaceOrder(accountDAO, orderDAO);
  getDepth = new GetDepth(orderDAO);
});

test("Deve obter a profundidade do mercado", async () => {
  const outputSignup = await signup.execute({
    name: "John Doe BTC",
    email: "john.doe.btc@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  });

  await deposit.execute(outputSignup.accountId, "BTC", 10);

  await placeOrder.execute(outputSignup.accountId, "BTC/USD", "sell", 84500, 2);
  await placeOrder.execute(outputSignup.accountId, "BTC/USD", "sell", 87500, 4);
  await placeOrder.execute(outputSignup.accountId, "BTC/USD", "sell", 84600, 1);
  await placeOrder.execute(outputSignup.accountId, "BTC/USD", "sell", 88000, 1);

  const outputSignup2 = await signup.execute({
    name: "John Doe USD",
    email: "john.doe.usd@gmail.com",
    document: "97456321558",
    password: "asdQWE124",
  });

  await deposit.execute(outputSignup2.accountId, "USD", 1000000);
  await placeOrder.execute(outputSignup2.accountId, "BTC/USD", "buy", 82150, 1);
  await placeOrder.execute(outputSignup2.accountId, "BTC/USD", "buy", 84150, 2);
  await placeOrder.execute(outputSignup2.accountId, "BTC/USD", "buy", 82850, 2);

  const outputGetDepthBTC = await getDepth.execute("BTC/USD", 3);
  expect(outputGetDepthBTC.sells.length).toBe(3);
  expect(outputGetDepthBTC.buys.length).toBe(2);
});

test.each([
  { marketId: "BCD/UVW", precision: 3, error: "Invalid market" },
  { marketId: "BTC/USD", precision: -3, error: "Invalid precision" },
])(
  "Não obter a profundidade do mercado",
  async (depth: { marketId: string; precision: number; error: string }) => {
    await expect(() =>
      getDepth.execute(depth.marketId, depth.precision),
    ).rejects.toThrow(depth.error);
  },
);
