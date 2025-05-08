import axios from "axios";

axios.defaults.validateStatus = () => true;

test("Deve criar uma ordem de venda", async () => {
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
    assetId: "BTC",
    quantity: 1,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseDeposit.status).toBe(200);

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 94000,
  };

  const responsePlaceOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  const outputPlaceOrder = responsePlaceOrder.data;
  expect(outputPlaceOrder.orderId).toBeDefined();

  const responseGetOrder = await axios.get(`http://localhost:3000/orders/${outputPlaceOrder.orderId}`);
  const outputGetOrder = responseGetOrder.data;

  expect(outputGetOrder.marketId).toBe(inputPlaceOrder.marketId);
  expect(outputGetOrder.side).toBe(inputPlaceOrder.side);
  expect(outputGetOrder.quantity).toBe(inputPlaceOrder.quantity);
  expect(outputGetOrder.price).toBe(inputPlaceOrder.price);
  expect(outputGetOrder.status).toBe("open");
  expect(outputGetOrder.timestamp).toBeDefined();
});

test("Deve criar uma ordem de compra", async () => {
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
    quantity: 100,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseDeposit.status).toBe(200);

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "buy",
    quantity: 0.001,
    price: 94,
  };

  const responsePlaceOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  const outputPlaceOrder = responsePlaceOrder.data;
  expect(outputPlaceOrder.orderId).toBeDefined();

  const responseGetOrder = await axios.get(`http://localhost:3000/orders/${outputPlaceOrder.orderId}`);
  const outputGetOrder = responseGetOrder.data;

  expect(outputGetOrder.marketId).toBe(inputPlaceOrder.marketId);
  expect(outputGetOrder.side).toBe(inputPlaceOrder.side);
  expect(outputGetOrder.quantity).toBe(inputPlaceOrder.quantity);
  expect(outputGetOrder.price).toBe(inputPlaceOrder.price);
  expect(outputGetOrder.status).toBe("open");
  expect(outputGetOrder.timestamp).toBeDefined();
});

test("Não deve criar uma ordem de venda sem saldo suficiente", async () => {
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
    assetId: "BTC",
    quantity: 1,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseDeposit.status).toBe(200);

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 2,
    price: 94000,
  };

  const responsePlaceOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  expect(responsePlaceOrder.status).toBe(422);
});

test("Não deve criar uma ordem de venda se o saldo já foi comprometido com outra ordem", async () => {
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
    assetId: "BTC",
    quantity: 1,
  };

  const responseDeposit = await axios.post("http://localhost:3000/deposit", inputDeposit);
  expect(responseDeposit.status).toBe(200);

  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId: outputSignup.accountId,
    side: "sell",
    quantity: 1,
    price: 94000,
  };

  const responsePlaceFirstOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  const outputPlaceFirstOrder = responsePlaceFirstOrder.data;
  expect(outputPlaceFirstOrder.orderId).toBeDefined();

  const responsePlaceSecondOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  expect(responsePlaceSecondOrder.status).toBe(422);
});

test.each(["123", "00000000-0000-0000-0000-000000000000"])("Não deve criar ordem em uma conta inválida", async (accountId: string) => {
  const inputPlaceOrder = {
    marketId: "BTC/USD",
    accountId,
    side: "sell",
    quantity: 1,
    price: 94000,
  };

  const responsePlaceSecondOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  expect(responsePlaceSecondOrder.status).toBe(422);
});

test.each([
  {marketId: "USD/USD", side: "sell", quantity: 1, price: 1},
  {marketId: "BTC/USD", side: "negociate", quantity: 1, price: 1},
  {marketId: "BTC/USD", side: "sell", quantity: -1, price: 1},
  {marketId: "BTC/USD", side: "sell", quantity: 1, price: -1},
])("Não deve criar ordem com dados inválidos", async (order: {marketId: string, side: string, quantity: number, price: number}) => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE123"
  };

  const responseSignup = await axios.post("http://localhost:3000/signup", inputSignup);
  const outputSignup = responseSignup.data;

  expect(outputSignup.accountId).toBeDefined();

  const inputPlaceOrder = {
    marketId: order.marketId,
    accountId: outputSignup.accountId,
    side: order.side,
    quantity: order.quantity,
    price: order.price,
  };

  const responsePlaceSecondOrder = await axios.post("http://localhost:3000/place_order", inputPlaceOrder);
  expect(responsePlaceSecondOrder.status).toBe(422);
});