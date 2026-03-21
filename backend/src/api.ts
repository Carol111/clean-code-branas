import express, { Request, Response } from "express";
import cors from "cors";
import Signup from "./Signup";
import GetAccount from "./GetAccount";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import PlaceOrder from "./PlaceOrder";
import GetOrder from "./GetOrder";
import { AccountDAODatabase } from "./AccountDAO";
import { OrderDAODatabase } from "./OrderDAO";

var corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const accountDAO = new AccountDAODatabase();
const orderDAO = new OrderDAODatabase();
const signup = new Signup(accountDAO);
const getAccount = new GetAccount(accountDAO);
const deposit = new Deposit(accountDAO);
const withdraw = new Withdraw(accountDAO);
const placeOrder = new PlaceOrder(accountDAO, orderDAO);
const getOrder = new GetOrder(orderDAO);

app.post("/signup", async (req: Request, res: Response): Promise<any> => {
  try {
    const input = req.body;
    const output = await signup.execute(input);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.get(
  "/accounts/:accountId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const accountId = req.params.accountId;
      const output = await getAccount.execute(accountId);
      res.json(output);
    } catch (e: any) {
      res.status(e.statusCode ?? 422).json({
        error: e.message,
      });
    }
  },
);

app.post("/deposit", async (req: Request, res: Response): Promise<any> => {
  try {
    const input = req.body;
    const output = await deposit.execute(
      input.accountId,
      input.assetId,
      input.quantity,
    );
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.post("/withdraw", async (req: Request, res: Response): Promise<any> => {
  try {
    const input = req.body;
    const output = await withdraw.execute(
      input.accountId,
      input.assetId,
      input.quantity,
    );
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.post("/place_order", async (req: Request, res: Response): Promise<any> => {
  try {
    const input = req.body;
    const output = await placeOrder.execute(
      input.accountId,
      input.marketId,
      input.side,
      input.price,
      input.quantity,
    );
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
      error: e.message,
    });
  }
});

app.get(
  "/orders/:orderId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const orderId = req.params.orderId;
      const output = await getOrder.execute(orderId);
      res.json(output);
    } catch (e: any) {
      res.status(e.statusCode ?? 422).json({
        error: e.message,
      });
    }
  },
);

app.listen(3000);
