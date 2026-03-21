import Signup from "../../src/Signup";
import GetAccount from "../../src/GetAccount";
import Deposit from "../../src/Deposit";
import PlaceOrder from "../../src/PlaceOrder";
import GetOrder from "../../src/GetOrder";
import { AccountDAODatabase } from "../../src/AccountDAO";
import { OrderDAODatabase } from "../../src/OrderDAO";

let signup: Signup;
let getAccount: GetAccount;
let deposit: Deposit;
let placeOrder: PlaceOrder;
let getOrder: GetOrder;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  const orderDAO = new OrderDAODatabase();
  signup = new Signup(accountDAO);
  getAccount = new GetAccount(accountDAO);
  deposit = new Deposit(accountDAO);
  placeOrder = new PlaceOrder(accountDAO, orderDAO);
  getOrder = new GetOrder(orderDAO);
});

test("Deve criar uma ordem de venda", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };

  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 94000,
  };

  const outputPlaceOrder = await placeOrder.execute(
    inputPlaceOrder.accountId,
    inputPlaceOrder.marketId,
    inputPlaceOrder.side,
    inputPlaceOrder.price,
    inputPlaceOrder.quantity,
  );

  expect(outputPlaceOrder.orderId).toBeDefined();

  const outputGetOrder = await getOrder.execute(outputPlaceOrder.orderId);

  expect(outputGetOrder.marketId).toBe(inputPlaceOrder.marketId);
  expect(outputGetOrder.side).toBe(inputPlaceOrder.side);
  expect(outputGetOrder.quantity).toBe(inputPlaceOrder.quantity);
  expect(outputGetOrder.price).toBe(inputPlaceOrder.price);
  expect(outputGetOrder.status).toBe("open");
  expect(outputGetOrder.timestamp).toBeDefined();
});

test("Deve criar uma ordem de compra", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 100,
  };

  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 0.001,
    price: 94,
  };

  const outputPlaceOrder = await placeOrder.execute(
    inputPlaceOrder.accountId,
    inputPlaceOrder.marketId,
    inputPlaceOrder.side,
    inputPlaceOrder.price,
    inputPlaceOrder.quantity,
  );
  expect(outputPlaceOrder.orderId).toBeDefined();

  const outputGetOrder = await getOrder.execute(outputPlaceOrder.orderId);

  expect(outputGetOrder.marketId).toBe(inputPlaceOrder.marketId);
  expect(outputGetOrder.side).toBe(inputPlaceOrder.side);
  expect(outputGetOrder.quantity).toBe(inputPlaceOrder.quantity);
  expect(outputGetOrder.price).toBe(inputPlaceOrder.price);
  expect(outputGetOrder.status).toBe("open");
  expect(outputGetOrder.timestamp).toBeDefined();
});

test("Não deve criar uma ordem de venda sem saldo suficiente", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };

  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 2,
    price: 94000,
  };

  await expect(() =>
    placeOrder.execute(
      inputPlaceOrder.accountId,
      inputPlaceOrder.marketId,
      inputPlaceOrder.side,
      inputPlaceOrder.price,
      inputPlaceOrder.quantity,
    ),
  ).rejects.toThrow("Insufficient amount for this order");
});

test("Não deve criar uma ordem de venda se o saldo já foi comprometido com outra ordem", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(inputSignup);

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 1,
  };

  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 94000,
  };

  await placeOrder.execute(
    inputPlaceOrder.accountId,
    inputPlaceOrder.marketId,
    inputPlaceOrder.side,
    inputPlaceOrder.price,
    inputPlaceOrder.quantity,
  );

  await expect(() =>
    placeOrder.execute(
      inputPlaceOrder.accountId,
      inputPlaceOrder.marketId,
      inputPlaceOrder.side,
      inputPlaceOrder.price,
      inputPlaceOrder.quantity,
    ),
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
  "Não deve criar ordem com dados inválidos",
  async (order: {
    marketId: string;
    side: string;
    quantity: number;
    price: number;
    error: string;
  }) => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    };

    const outputSignup = await signup.execute(inputSignup);

    const inputPlaceOrder = {
      marketId: order.marketId,
      accountId: outputSignup.accountId,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
    };

    await expect(() =>
      placeOrder.execute(
        inputPlaceOrder.accountId,
        inputPlaceOrder.marketId,
        inputPlaceOrder.side,
        inputPlaceOrder.price,
        inputPlaceOrder.quantity,
      ),
    ).rejects.toThrow(order.error);
  },
);
