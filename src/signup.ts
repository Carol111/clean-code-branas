import express, { Request, Response} from "express";
import crypto from "crypto";

const app = express();

app.post("/signup", async (req: Request, res:  Response) => {
  const accountId = crypto.randomUUID();

  res.json({
    accountId
  });
})

app.listen(3000);