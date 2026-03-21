import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import { AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";

let signup: Signup;
let getAccount: GetAccount;
let deposit: Deposit;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  signup = new Signup(accountDAO);
  getAccount = new GetAccount(accountDAO);
  deposit = new Deposit(accountDAO);
});

test.each([
  { assetId: "USD", quantity: 10 },
  { assetId: "BTC", quantity: 0.000123 },
])(
  "Deve fazer um depósito válido",
  async (depositData: { assetId: string; quantity: number }) => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    };

    const outputSignup = await signup.execute(inputSignup);

    await deposit.execute(
      outputSignup.accountId,
      depositData.assetId,
      depositData.quantity,
    );

    const outputGetAccount = await getAccount.execute(outputSignup.accountId);

    expect(outputGetAccount.assets).toHaveLength(1);
    expect(outputGetAccount.assets[0].assetId).toBe(depositData.assetId);
    expect(outputGetAccount.assets[0].quantity).toBe(depositData.quantity);
  },
);

test("Deve fazer um depósito válido e incrementar saldo atual", async () => {
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
    quantity: 0.123,
  };

  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );
  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );

  const outputGetAccount = await getAccount.execute(outputSignup.accountId);

  expect(outputGetAccount.assets[0].quantity).toBe(
    inputDeposit.quantity + inputDeposit.quantity,
  );
});

test("Não deve fazer um depósito de asset inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(inputSignup);

  await expect(() =>
    deposit.execute(outputSignup.accountId, "xxx", 10),
  ).rejects.toThrow("Invalid asset");
});

test("Não deve fazer um depósito de valor inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123",
  };

  const outputSignup = await signup.execute(inputSignup);

  await expect(() =>
    deposit.execute(outputSignup.accountId, "BTC", -10),
  ).rejects.toThrow("Invalid quantity");
});

test.each(["123", "00000000-0000-0000-0000-000000000000"])(
  "Não deve fazer um depósito em uma conta inválida",
  async (accountId: string) => {
    const inputDeposit = {
      accountId,
      assetId: "BTC",
      quantity: 1,
    };

    await expect(() => deposit.execute(accountId, "BTC", 1)).rejects.toThrow(
      "Invalid account",
    );
  },
);
