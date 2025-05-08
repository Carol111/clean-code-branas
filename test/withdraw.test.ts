import axios from "axios";

axios.defaults.validateStatus = () => true;

test("Deve fazer um saque válido", async () => {
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
    assetId: "USD",
    quantity: 10,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseDeposit.status).toBe(200);

  const inputWithdraw = {
    accountId: outputSignup.accountId,
    assetId: "USD",
    quantity: 7,
  };

  const responseWithdraw = await axios.post("http://localhost:3000/withdraw", inputWithdraw);
  expect(responseWithdraw.status).toBe(200);

  const responseGetAccount = await axios.get(`http://localhost:3000/accounts/${outputSignup.accountId}`);
  const outputGetAccount = responseGetAccount.data;

  expect(outputGetAccount.assets).toHaveLength(1);
  expect(outputGetAccount.assets[0].assetId).toBe("USD");
  expect(outputGetAccount.assets[0].quantity).toBe(3);
});

test.each([
  {deposit: {assetId: "USD", quantity: 10}, withdraw: {assetId: "USD", quantity: 15}},
  {deposit: {assetId: "USD", quantity: 10}, withdraw: {assetId: "BTC", quantity: 5}},
])("Não deve fazer um saque sem fundos", async (transaction: {deposit: {assetId: string, quantity: number}, withdraw: {assetId: string, quantity: number}}) => {
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
    assetId: transaction.deposit.assetId,
    quantity: transaction.deposit.quantity,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseDeposit.status).toBe(200);

  const inputWithdraw = {
    accountId: outputSignup.accountId,
    assetId: transaction.withdraw.assetId,
    quantity: transaction.withdraw.quantity,
  };

  const responseWithdraw = await axios.post("http://localhost:3000/withdraw", inputWithdraw);
  expect(responseWithdraw.status).toBe(422);
});

test("Não deve fazer um saque de asset inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
  const outputSignup = responseSignup.data;

  const inputWithdraw = {
    accountId: outputSignup.accountId,
    assetId: "xxx",
    quantity: 10,
  };

  const responseWithdraw = await axios.post("http://localhost:3000/withdraw", inputWithdraw);
  expect(responseWithdraw.status).toBe(422);
});

test.each(["123", "00000000-0000-0000-0000-000000000000"])("Não deve fazer um saque inválido", async (accountId: string) => {
  const inputWithdraw = {
    accountId,
    assetId: "USD",
    quantity: 10,
  };

  const responseWithdraw = await axios.post("http://localhost:3000/withdraw", inputWithdraw);
  expect(responseWithdraw.status).toBe(422);
});