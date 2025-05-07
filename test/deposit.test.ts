import axios from "axios";

axios.defaults.validateStatus = () => true;

test.each([
  {assetId: "USD", quantity: 10},
  {assetId: "BTC", quantity: 0.000123},
])("Deve fazer um depósito válido", async (deposit: {assetId: string, quantity: number}) => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
  const outputSignup = responseSignup.data;

  expect(outputSignup.accountId).toBeDefined();

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: deposit.assetId,
    quantity: deposit.quantity,
  };

  const responseFirstDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseFirstDeposit.status).toBe(200);

  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount = responseGetAccount.data;

  expect(outputGetAccount.assets).toHaveLength(1);
  expect(outputGetAccount.assets[0].assetId).toBe(deposit.assetId);
  expect(outputGetAccount.assets[0].quantity).toBe(deposit.quantity);
});

test("Deve fazer um depósito válido e incrementar saldo atual", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
  const outputSignup = responseSignup.data;

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: "BTC",
    quantity: 0.123,
  };

  await axios.post("http://localhost:3000/deposit", inputDeposit);
  await axios.post("http://localhost:3000/deposit", inputDeposit);

  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount = responseGetAccount.data;

  expect(outputGetAccount.assets[0].quantity).toBe(inputDeposit.quantity + inputDeposit.quantity);
});

test.each([
  {assetId: "xxx", quantity: 10},
  {assetId: "BTC", quantity: -2},
])("Não deve fazer um depósito inválido", async (deposit: {assetId: string, quantity: number}) => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
  const outputSignup = responseSignup.data;

  expect(outputSignup.accountId).toBeDefined();

  const inputDeposit = {
    accountId: outputSignup.accountId,
    assetId: deposit.assetId,
    quantity: deposit.quantity,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);

  expect(responseDeposit.status).toBe(422);
});

test.each(["123", "00000000-0000-0000-0000-000000000000"])("Não deve fazer um depósito em uma conta inválida", async (accountId: string) => {
  const inputDeposit = {
    accountId,
    assetId: "BTC",
    quantity: 1,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);

  expect(responseDeposit.status).toBe(422);
});