import Signup from "../../src/application/usecase/Signup";
import Deposit from "../../src/application/usecase/Deposit";
import Withdraw from "../../src/application/usecase/Withdraw";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import GetAccount from "../../src/application/usecase/GetAccount";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";

describe("Withdraw", () => {
  let signup: Signup;
  let getAccount: GetAccount;
  let withdraw: Withdraw;
  let deposit: Deposit;
  let accountId: string;
  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = new PgPromiseAdapter(process.env.DATABASE_TEST_URL!);
    await connection.query("BEGIN");

    const accountRepository = new AccountRepositoryDatabase(connection);
    signup = new Signup(accountRepository);
    getAccount = new GetAccount(accountRepository);
    withdraw = new Withdraw(accountRepository);
    deposit = new Deposit(accountRepository);

    const outputSignup = await signup.execute({
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    });

    accountId = outputSignup.accountId;
  });

  test("Should make a valid withdrawal", async () => {
    await deposit.execute({
      accountId,
      assetId: "USD",
      quantity: 10,
    });

    await withdraw.execute({
      accountId,
      assetId: "USD",
      quantity: 7,
    });

    const outputGetAccount = await getAccount.execute(accountId);

    expect(outputGetAccount.assets).toHaveLength(1);
    expect(outputGetAccount.assets[0].assetId).toBe("USD");
    expect(outputGetAccount.assets[0].quantity).toBe(10 - 7);
  });

  test.each([
    {
      deposit: { assetId: "USD", quantity: 10 },
      withdraw: { assetId: "USD", quantity: 15 },
      error: "Insufficient funds",
    },
    {
      deposit: { assetId: "USD", quantity: 10 },
      withdraw: { assetId: "BTC", quantity: 5 },
      error: "Asset not found",
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
      await deposit.execute({
        accountId,
        assetId: transaction.deposit.assetId,
        quantity: transaction.deposit.quantity,
      });

      await expect(() =>
        withdraw.execute({
          accountId,
          assetId: transaction.withdraw.assetId,
          quantity: transaction.withdraw.quantity,
        }),
      ).rejects.toThrow(transaction.error);
    },
  );

  afterEach(async () => {
    await connection.query("ROLLBACK");
    await connection.close();
  });
});
