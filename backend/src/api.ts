import express, { Request, Response} from "express";
import cors from "cors";
import { deposit, withdraw, placeOrder, getOrder } from "./application";
import Signup from "./Signup";
import GetAccount from "./GetAccount";
import { AccountDAODatabase } from "./AccountDAO";

var corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
}

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const accountDAO = new AccountDAODatabase();
const signup = new Signup(accountDAO);
const getAccount = new GetAccount(accountDAO);

app.post("/signup", async (req: Request, res:  Response): Promise<any> => {
  try {
    const input = req.body;
    const output = await signup.execute(input);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
        error: e.message
    });
  }
});

app.get("/accounts/:accountId", async (req: Request, res:  Response): Promise<any> => {
  try {
    const accountId = req.params.accountId;
    const output = await getAccount.execute(accountId);
    res.json(output);
  } catch (e: any) {
    res.status(e.statusCode ?? 422).json({
        error: e.message
    });
  }
});

app.post("/deposit", async (req: Request, res:  Response): Promise<any> => {
  try {
    const input = req.body;
    await deposit(input);
    res.end();
  } catch (e: any) {
    res.status(422).json({
        error: e.message
    });
  }
});

app.post("/withdraw", async (req: Request, res:  Response): Promise<any> => {
  try {
    const input = req.body;
    await withdraw(input);
    res.end();
  } catch (e: any) {
    res.status(422).json({
        error: e.message
    });
  }
});

app.post("/place_order", async (req: Request, res: Response): Promise<any> => {
  try {
    const input = req.body;
    const output = await placeOrder(input);
    res.json(output);
  } catch (e: any) {
    res.status(422).json({
        error: e.message
    });
  }
});

app.get("/orders/:orderId", async (req: Request, res: Response): Promise<any> => {
  try {
    const orderId = req.params.orderId;
    const output = await getOrder(orderId);
    res.json(output);
  } catch (e: any) {
    res.status(e.statusCode ?? 422).json({
        error: e.message
    });
  }
});

app.listen(3000);