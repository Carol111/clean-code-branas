import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import { AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";

describe("Deposit", () => {
  let signup: Signup;
  let getAccount: GetAccount;
  let deposit: Deposit;
  let accountId: string;

  beforeEach(async () => {
    const accountDAO = new AccountDAODatabase();
    signup = new Signup(accountDAO);
    getAccount = new GetAccount(accountDAO);
    deposit = new Deposit(accountDAO);

    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    };

    const outputSignup = await signup.execute(inputSignup);
    accountId = outputSignup.accountId;
  });

  test.each([
    { assetId: "USD", quantity: 10 },
    { assetId: "BTC", quantity: 0.000123 },
  ])(
    "Should make a valid deposit",
    async (depositData: { assetId: string; quantity: number }) => {
      await deposit.execute(
        accountId,
        depositData.assetId,
        depositData.quantity,
      );

      const outputGetAccount = await getAccount.execute(accountId);

      expect(outputGetAccount.assets).toHaveLength(1);
      expect(outputGetAccount.assets[0].assetId).toBe(depositData.assetId);
      expect(outputGetAccount.assets[0].quantity).toBe(depositData.quantity);
    },
  );

  test("Should make a valid deposit and increment the current balance", async () => {
    await deposit.execute(accountId, "BTC", 0.123);
    await deposit.execute(accountId, "BTC", 0.123);

    const outputGetAccount = await getAccount.execute(accountId);

    expect(outputGetAccount.assets[0].quantity).toBe(0.123 + 0.123);
  });

  test("Should not make a deposit with an invalid asset", async () => {
    await expect(() => deposit.execute(accountId, "xxx", 10)).rejects.toThrow(
      "Invalid asset",
    );
  });

  test("Should not make a deposit with an invalid quantity", async () => {
    await expect(() => deposit.execute(accountId, "BTC", -10)).rejects.toThrow(
      "Invalid quantity",
    );
  });
});
