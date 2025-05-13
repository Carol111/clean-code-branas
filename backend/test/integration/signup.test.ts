import { getAccount, signup } from "../../src/application";

test("Deve criar uma conta válida", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const outputSignup = await signup(inputSignup);

  expect(outputSignup.accountId).toBeDefined();

  const outputGetAccount = await getAccount(outputSignup.accountId);

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

  await expect(() => signup(inputSignup)).rejects.toThrow("Invalid name");
});

test("Não deve criar uma conta com email inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe",
    document: "97456321558",
    password: "asdQWE123"
  };

  await expect(() => signup(inputSignup)).rejects.toThrow("Invalid email");
});

test("Não deve criar uma conta com CPF inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "974563215",
    password: "asdQWE123"
  };

  await expect(() => signup(inputSignup)).rejects.toThrow("Invalid document");
});

test("Não deve criar uma conta com senha inválida", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE"
  };

  await expect(() => signup(inputSignup)).rejects.toThrow("Invalid password");
});