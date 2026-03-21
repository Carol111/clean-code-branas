import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import Withdraw from "../../src/Withdraw";
import { AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";

let signup: Signup;
let getAccount: GetAccount;
let withdraw: Withdraw;
let deposit: Deposit;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  signup = new Signup(accountDAO);
  getAccount = new GetAccount(accountDAO);
  withdraw = new Withdraw(accountDAO);
  deposit = new Deposit(accountDAO);
});

test("Deve fazer um saque válido", async () => {
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
    quantity: 10,
  };

  await deposit.execute(
    inputDeposit.accountId,
    inputDeposit.assetId,
    inputDeposit.quantity,
  );

  const inputWithdraw = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 7,
  };

  await withdraw.execute(
    inputWithdraw.accountId,
    inputWithdraw.assetId,
    inputWithdraw.quantity,
  );

  const outputGetAccount = await getAccount.execute(outputSignup.accountId);

  expect(outputGetAccount.assets).toHaveLength(1);
  expect(outputGetAccount.assets[0].assetId).toBe(inputDeposit.assetId);
  expect(outputGetAccount.assets[0].quantity).toBe(
    inputDeposit.quantity - inputWithdraw.quantity,
  );
});

test.each([
  {
    deposit: { assetId: "USD", quantity: 10 },
    withdraw: { assetId: "USD", quantity: 15 },
    error: "Insufficient amount for withdrawal",
  },
  {
    deposit: { assetId: "USD", quantity: 10 },
    withdraw: { assetId: "BTC", quantity: 5 },
    error: "No funds available for this asset",
  },
  {
    deposit: { assetId: "USD", quantity: 10 },
    withdraw: { assetId: "xxx", quantity: 5 },
    error: "Invalid asset",
  },
  {
    deposit: { assetId: "USD", quantity: 10 },
    withdraw: { assetId: "BTC", quantity: -5 },
    error: "Invalid quantity",
  },
])(
  "Não deve fazer um saque inválido",
  async (transaction: {
    deposit: { assetId: string; quantity: number };
    withdraw: { assetId: string; quantity: number };
    error: string;
  }) => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    };

    const outputSignup = await signup.execute(inputSignup);

    const inputDeposit = {
      accountId: outputSignup.accountId,
      assetId: transaction.deposit.assetId,
      quantity: transaction.deposit.quantity,
    };

    await deposit.execute(
      inputDeposit.accountId,
      inputDeposit.assetId,
      inputDeposit.quantity,
    );

    const inputWithdraw = {
      accountId: outputSignup.accountId,
      assetId: transaction.withdraw.assetId,
      quantity: transaction.withdraw.quantity,
    };

    await expect(() =>
      withdraw.execute(
        inputWithdraw.accountId,
        inputWithdraw.assetId,
        inputWithdraw.quantity,
      ),
    ).rejects.toThrow(transaction.error);
  },
);

test.each(["123", "00000000-0000-0000-0000-000000000000"])(
  "Não deve fazer um saque de uma conta inválida",
  async (accountId: string) => {
    const inputWithdraw = {
      accountId,
      assetId: "USD",
      quantity: 10,
    };

    await expect(() =>
      withdraw.execute(
        inputWithdraw.accountId,
        inputWithdraw.assetId,
        inputWithdraw.quantity,
      ),
    ).rejects.toThrow("Invalid account");
  },
);
