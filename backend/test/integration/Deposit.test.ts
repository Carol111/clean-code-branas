import Signup from "../../src/application/usecase/Signup";
import Deposit from "../../src/application/usecase/Deposit";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import GetAccount from "../../src/application/usecase/GetAccount";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";

describe("Deposit", () => {
  let signup: Signup;
  let getAccount: GetAccount;
  let deposit: Deposit;
  let accountId: string;
  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = new PgPromiseAdapter();
    const accountRepository = new AccountRepositoryDatabase(connection);
    signup = new Signup(accountRepository);
    getAccount = new GetAccount(accountRepository);
    deposit = new Deposit(accountRepository);

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
      await deposit.execute({
        accountId,
        assetId: depositData.assetId,
        quantity: depositData.quantity,
      });

      const outputGetAccount = await getAccount.execute(accountId);

      expect(outputGetAccount.assets).toHaveLength(1);
      expect(outputGetAccount.assets[0].assetId).toBe(depositData.assetId);
      expect(outputGetAccount.assets[0].quantity).toBe(depositData.quantity);
    },
  );

  test("Should make a valid deposit and increment the current balance", async () => {
    await deposit.execute({
      accountId,
      assetId: "BTC",
      quantity: 0.123,
    });
    await deposit.execute({
      accountId,
      assetId: "BTC",
      quantity: 0.123,
    });

    const outputGetAccount = await getAccount.execute(accountId);

    expect(outputGetAccount.assets[0].quantity).toBe(0.123 + 0.123);
  });

  test("Should not make a deposit with an invalid asset", async () => {
    await expect(() =>
      deposit.execute({
        accountId,
        assetId: "xxx",
        quantity: 10,
      }),
    ).rejects.toThrow("Invalid asset");
  });

  test("Should not make a deposit with an invalid quantity", async () => {
    await expect(() =>
      deposit.execute({
        accountId,
        assetId: "BTC",
        quantity: -10,
      }),
    ).rejects.toThrow("Invalid quantity");
  });

  afterEach(async () => {
    await connection.close();
  });
});
