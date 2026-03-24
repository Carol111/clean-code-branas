import Signup from "../../src/Signup";
import { AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";

describe("Signup", () => {
  let signup: Signup;
  let getAccount: GetAccount;

  beforeEach(() => {
    const accountDAO = new AccountDAODatabase();
    signup = new Signup(accountDAO);
    getAccount = new GetAccount(accountDAO);
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

  test("Should not create an account with invalid email", async () => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe",
      document: "97456321558",
      password: "asdQWE123",
    };

    await expect(() => signup.execute(inputSignup)).rejects.toThrow(
      "Invalid email",
    );
  });

  test("Should not create an account with invalid document", async () => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "974563215",
      password: "asdQWE123",
    };

    await expect(() => signup.execute(inputSignup)).rejects.toThrow(
      "Invalid document",
    );
  });

  test("Should not create an account with invalid password", async () => {
    const inputSignup = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      document: "97456321558",
      password: "asdQWE",
    };

    await expect(() => signup.execute(inputSignup)).rejects.toThrow(
      "Invalid password",
    );
  });
});
