import Signup from "../../src/Signup";
import { AccountDAOMemory, AccountDAODatabase } from "../../src/AccountDAO";
import GetAccount from "../../src/GetAccount";
import sinon from "sinon";

let signup: Signup;
let getAccount: GetAccount;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  // const accountDAO = new AccountDAOMemory();
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

test("Não deve criar uma conta com email inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe",
    document: "97456321558",
    password: "asdQWE123"
  };

  await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid email");
});

test("Não deve criar uma conta com CPF inválido", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "974563215",
    password: "asdQWE123"
  };

  await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid document");
});

test("Não deve criar uma conta com senha inválida", async () => {
  const inputSignup = {
    name: "John Doe",
    email: "john.doe@gmail.com",
    document: "97456321558",
    password: "asdQWE"
  };

  await expect(() => signup.execute(inputSignup)).rejects.toThrow("Invalid password");
});

// test("Deve criar uma conta válida com stub", async () => {
//     const saveAccountStub = sinon.stub(AccountDAODatabase.prototype, "insertAccount").resolves();
//     const inputSignup = {
//         name: "John Doe",
//         email: "john.doe@gmail.com",
//         document: "97456321558",
//         password: "asdQWE123"
//     }
//     const getAccountByIdStub = sinon.stub(AccountDAODatabase.prototype, "selectAccount").resolves(inputSignup);
//     const getAccountAssets = sinon.stub(AccountDAODatabase.prototype, "selectAccountAssets").resolves([]);
//     const outputSignup = await signup.execute(inputSignup);
//     expect(outputSignup.accountId).toBeDefined();
//     const outputGetAccount = await getAccount.execute(outputSignup.accountId)
//     expect(outputGetAccount.name).toBe(inputSignup.name);
//     expect(outputGetAccount.email).toBe(inputSignup.email);
//     expect(outputGetAccount.document).toBe(inputSignup.document);
//     saveAccountStub.restore();
//     getAccountByIdStub.restore();
//     getAccountAssets.restore();
// });

// test("Deve criar uma conta válida com spy", async () => {
//     const saveAccountSpy = sinon.spy(AccountDAODatabase.prototype, "insertAccount");
//     const inputSignup = {
//         name: "John Doe",
//         email: "john.doe@gmail.com",
//         document: "97456321558",
//         password: "asdQWE123"
//     }
//     const outputSignup = await signup.execute(inputSignup);
//     expect(outputSignup.accountId).toBeDefined();
//     const outputGetAccount = await getAccount.execute(outputSignup.accountId)
//     expect(outputGetAccount.name).toBe(inputSignup.name);
//     expect(outputGetAccount.email).toBe(inputSignup.email);
//     expect(outputGetAccount.document).toBe(inputSignup.document);
//     expect(saveAccountSpy.calledOnce).toBe(true);
//     expect(saveAccountSpy.calledWith(Object.assign(inputSignup, outputSignup))).toBe(true);
//     saveAccountSpy.restore();
// });

// test("Deve criar uma conta válida com mock", async () => {
//     const accountDAOMock = sinon.mock(AccountDAODatabase.prototype);
//     accountDAOMock.expects("insertAccount").once().resolves();
//     const inputSignup = {
//         name: "John Doe",
//         email: "john.doe@gmail.com",
//         document: "97456321558",
//         password: "asdQWE123"
//     }
//     accountDAOMock.expects("selectAccount").once().resolves(inputSignup);
//     accountDAOMock.expects("selectAccountAssets").once().resolves([]);
//     const outputSignup = await signup.execute(inputSignup);
//     expect(outputSignup.accountId).toBeDefined();
//     const outputGetAccount = await getAccount.execute(outputSignup.accountId)
//     expect(outputGetAccount.name).toBe(inputSignup.name);
//     expect(outputGetAccount.email).toBe(inputSignup.email);
//     expect(outputGetAccount.document).toBe(inputSignup.document);
//     accountDAOMock.verify();
//     accountDAOMock.restore();
// });

// test.only("Deve criar uma conta válida com fake", async () => {
//     const accountDAO = new AccountDAOMemory();
//     signup = new Signup(accountDAO);
//     getAccount = new GetAccount(accountDAO);
//     const inputSignup = {
//         name: "John Doe",
//         email: "john.doe@gmail.com",
//         document: "97456321558",
//         password: "asdQWE123"
//     }
//     const outputSignup = await signup.execute(inputSignup);
//     expect(outputSignup.accountId).toBeDefined();
//     const outputGetAccount = await getAccount.execute(outputSignup.accountId)
//     expect(outputGetAccount.name).toBe(inputSignup.name);
//     expect(outputGetAccount.email).toBe(inputSignup.email);
//     expect(outputGetAccount.document).toBe(inputSignup.document);
// });