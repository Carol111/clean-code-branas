import Signup from "./Signup";
import GetAccount from "./GetAccount";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import PlaceOrder from "./PlaceOrder";
import GetOrder from "./GetOrder";
import GetDepth from "./GetDepth";
import { AccountRepositoryDatabase } from "./AccountRepository";
import { OrderRepositoryDatabase } from "./OrderRepository";
import { ExpressAdapter } from "./HttpServer";
import { setupWebsocket } from "./Websocket";
import AccountController from "./AccountController";
import OrderController from "./OrderController";

const httpServer = new ExpressAdapter();
const accountRepository = new AccountRepositoryDatabase();
const orderRepository = new OrderRepositoryDatabase();
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
