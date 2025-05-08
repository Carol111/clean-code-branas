import express, { Request, Response} from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";

const app = express();
app.use(express.json());

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

function isValidName (name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail (email: string) {
  return email.match(/^(.+)\@(.+)$/);
}

function isValidPassword (password: string) {
  if (password.length < 8) return false;
  if (!password.match(/\d+/)) return false;
  if (!password.match(/[a-z]+/)) return false;
  if (!password.match(/[A-Z]+/)) return false;
  return true;
}

function isValidUUID (uuid: string) {
  return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
}

app.post("/signup", async (req: Request, res:  Response): Promise<any> => {
  const input = req.body;

  if (!isValidName(input.name)) {
    return res.status(422).json({
      error: "Invalid name"
    });
  }

  if (!isValidEmail(input.email)) {
    return res.status(422).json({
      error: "Invalid email"
    });
  }

  if (!validateCpf(input.document)) {
    return res.status(422).json({
      error: "Invalid document"
    });
  }

  if (!isValidPassword(input.password)) {
    return res.status(422).json({
      error: "Invalid password"
    });
  }

  const accountId = crypto.randomUUID();
  const account = {
    accountId,
    name: input.name,
    email: input.email,
    document: input.document,
    password: input.password,
  };

  await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.document, account.password]);

  res.json({
    accountId
  });
})

app.get("/accounts/:accountId", async (req: Request, res:  Response) => {
  const accountId = req.params.accountId;
  const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
  const accountAssetsData = await connection.query("select * from ccca.account_asset where account_id = $1", [accountId]);

  accountData.assets = [];
  for (const accountAssetData of accountAssetsData) {
      accountData.assets.push({ assetId: accountAssetData.asset_id, quantity: parseFloat(accountAssetData.quantity) });
  }

  res.json(accountData);
});

app.post("/deposit", async (req: Request, res:  Response): Promise<any> => {
  const input = req.body;

  if (!isValidUUID(input.accountId)) {
    return res.status(422).json({
      error: "Invalid account"
    });
  }

  const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [input.accountId]);

  if (!accountData) {
    return res.status(422).json({
      error: "Invalid account"
    });
  }

  if (!["BTC", "USD"].includes(input.assetId)) {
    return res.status(422).json({
      error: "Invalid asset"
    });
  }

  if (input.quantity <= 0) {
    return res.status(422).json({
      error: "Invalid quantity"
    });
  }

  const [accountAssetsData] = await connection.query("select * from ccca.account_asset where account_id = $1 and asset_id = $2", [input.accountId, input.assetId]);

  if (accountAssetsData) {
    const newQuantity = parseFloat(accountAssetsData.quantity) + input.quantity;

    await connection.query("update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3", [newQuantity, input.accountId, input.assetId]);

    return res.end();
  }

  await connection.query("insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)", [input.accountId, input.assetId, input.quantity]);

  res.end();
})

app.listen(3000);