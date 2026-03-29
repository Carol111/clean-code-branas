import Signup from "./application/usecase/Signup";
import GetAccount from "./application/usecase/GetAccount";
import Deposit from "./application/usecase/Deposit";
import Withdraw from "./application/usecase/Withdraw";
import PlaceOrder from "./application/usecase/PlaceOrder";
import GetOrder from "./application/usecase/GetOrder";
import GetDepth from "./application/usecase/GetDepth";
import { AccountRepositoryDatabase } from "./infra/repository/AccountRepository";
import { OrderRepositoryDatabase } from "./infra/repository/OrderRepository";
import { ExpressAdapter } from "./infra/http/HttpServer";
import { setupWebsocket } from "./infra/websocket/Websocket";
import AccountController from "./infra/controller/AccountController";
import OrderController from "./infra/controller/OrderController";
import { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.DATABASE_TEST_URL!
    : process.env.DATABASE_URL!;

const httpServer = new ExpressAdapter();
const connection = new PgPromiseAdapter(connectionString);
const accountRepository = new AccountRepositoryDatabase(connection);
const orderRepository = new OrderRepositoryDatabase(connection);
const signup = new Signup(accountRepository);
const getAccount = new GetAccount(accountRepository);
const deposit = new Deposit(accountRepository);
const withdraw = new Withdraw(accountRepository);
const placeOrder = new PlaceOrder(accountRepository, orderRepository);
const getOrder = new GetOrder(orderRepository);
const getDepth = new GetDepth(orderRepository);

AccountController.config(httpServer, signup, getAccount, deposit, withdraw);
OrderController.config(httpServer, placeOrder, getOrder);

setupWebsocket(httpServer.server, getDepth);

httpServer.listen(3000);
