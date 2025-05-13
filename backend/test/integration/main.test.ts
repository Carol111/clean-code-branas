import Signup from "../../src/Signup";
import { AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";

let signup: Signup;
let getAccount: GetAccount;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  signup = new Signup(accountDAO);
  getAccount = new GetAccount(accountDAO);
})

test("Deve criar uma conta válida", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const outputSignup = await signup.execute(inputSignup);

  expect(outputSignup.accountId).toBeDefined();

  const outputGetAccount = await getAccount.execute(outputSignup.accountId);

  expect(outputGetAccount.name).toBe(inputSignup.name);
  expect(outputGetAccount.email).toBe(inputSignup.email);
  expect(outputGetAccount.document).toBe(inputSignup.document);
});

test("Não deve criar uma conta com nome inválido", async () => {
  const inputSignup = {
    name: "John",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid name");
});
