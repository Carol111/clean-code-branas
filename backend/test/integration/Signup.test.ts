import Signup from "../../src/Signup";
import { AccountRepositoryDatabase } from "../../src/AccountRepository";
import GetAccount from "../../src/GetAccount";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/DatabaseConnection";

describe("Signup", () => {
  let signup: Signup;
  let getAccount: GetAccount;
  let connection: DatabaseConnection;

  beforeEach(() => {
    connection = new PgPromiseAdapter();
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
    await connection.close();
  });
});
