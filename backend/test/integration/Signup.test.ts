import Signup from "../../src/application/usecase/Signup";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import GetAccount from "../../src/application/usecase/GetAccount";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";

describe("Signup", () => {
  let signup: Signup;
  let getAccount: GetAccount;
  let connection: DatabaseConnection;

  beforeEach(async () => {
    connection = new PgPromiseAdapter(process.env.DATABASE_TEST_URL!);
    await connection.query("BEGIN");

    const accountRepository = new AccountRepositoryDatabase(connection);
    signup = new Signup(accountRepository);
    getAccount = new GetAccount(accountRepository);
  });

  test("Should create a valid account", async () => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    };

    const outputSignup = await signup.execute(inputSignup);

    expect(outputSignup.accountId).toBeDefined();

    const outputGetAccount = await getAccount.execute(outputSignup.accountId);

    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.document).toBe(inputSignup.document);
  });

  test("Should not create an account with invalid name", async () => {
    const inputSignup = {
      name: "John",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    };

    await expect(() => signup.execute(inputSignup)).rejects.toThrow(
      "Invalid name",
    );
  });

  afterEach(async () => {
    await connection.query("ROLLBACK");
    await connection.close();
  });
});
