import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import Withdraw from "../../src/Withdraw";
import { AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";

describe("Withdraw", () => {
  let signup: Signup;
  let getAccount: GetAccount;
  let withdraw: Withdraw;
  let deposit: Deposit;
  let accountId: string;

  beforeEach(async () => {
    const accountDAO = new AccountDAODatabase();
    signup = new Signup(accountDAO);
    getAccount = new GetAccount(accountDAO);
    withdraw = new Withdraw(accountDAO);
    deposit = new Deposit(accountDAO);

    const outputSignup = await signup.execute({
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    });

    accountId = outputSignup.accountId;
  });

  test("Should make a valid withdrawal", async () => {
    await deposit.execute(accountId, "USD", 10);

    await withdraw.execute(accountId, "USD", 7);

    const outputGetAccount = await getAccount.execute(accountId);

    expect(outputGetAccount.assets).toHaveLength(1);
    expect(outputGetAccount.assets[0].assetId).toBe("USD");
    expect(outputGetAccount.assets[0].quantity).toBe(10 - 7);
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
    "Should not make an invalid withdrawal",
    async (transaction: {
      deposit: { assetId: string; quantity: number };
      withdraw: { assetId: string; quantity: number };
      error: string;
    }) => {
      await deposit.execute(
        accountId,
        transaction.deposit.assetId,
        transaction.deposit.quantity,
      );

      await expect(() =>
        withdraw.execute(
          accountId,
          transaction.withdraw.assetId,
          transaction.withdraw.quantity,
        ),
      ).rejects.toThrow(transaction.error);
    },
  );
});
