import express, { Request, Response} from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const accounts: any = [];

app.post("/signup", async (req: Request, res:  Response) => {
  const input = req.body;
  const accountId = crypto.randomUUID();
  const account = {
    accountId,
    name: input.name,
    email: input.email,
    document: input.document,
    password: input.password,
  };
  accounts.push(account);

  res.json({
    accountId
  });
})

app.listen(3000);