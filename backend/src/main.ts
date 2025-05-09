import express, { Request, Response} from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";
import { isValidPassword } from "./validatePassword";
import cors from "cors";

var corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
}

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

function isValidName (name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail (email: string) {
  return email.match(/^(.+)\@(.+)$/);
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
});

app.get("/accounts/:accountId", async (req: Request, res:  Response): Promise<any> => {
  const accountId = req.params.accountId;

  if (!isValidUUID(accountId)) {
    return res.status(422).json({
      error: "Invalid account"
    });
  }

  const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);

  if (!accountData) {
    return res.status(404).json({
      error: "No account found"
    });
  }

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
});

app.post("/withdraw", async (req: Request, res:  Response): Promise<any> => {
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

  if (!accountAssetsData) {
    return res.status(422).json({
      error: "No funds available for this asset"
    });
  }

  if (parseFloat(accountAssetsData.quantity) < input.quantity) {
    return res.status(422).json({
      error: "Insufficient amount for withdrawal"
    });
  }

  const newQuantity = parseFloat(accountAssetsData.quantity) - input.quantity;

  await connection.query("update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3", [newQuantity, input.accountId, input.assetId]);

  res.end();
});

app.post("/place_order", async (req: Request, res: Response): Promise<any> => {
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

    if (!["BTC/USD", "USD/BTC"].includes(input.marketId)) {
      return res.status(422).json({
        error: "Invalid order"
      });
    }

    if (!["sell", "buy"].includes(input.side)) {
      return res.status(422).json({
        error: "Invalid order"
      });
    }

    if (input.quantity <= 0) {
      return res.status(422).json({
        error: "Invalid quantity"
      });
    }

    if (input.price <= 0) {
      return res.status(422).json({
        error: "Invalid price"
      });
    }

    const assetsId = input.marketId.split("/");
    const assetId = input.side === "sell" ? assetsId[0] : assetsId[1];

    const [accountAssetsData] = await connection.query("select * from ccca.account_asset where account_id = $1 and asset_id = $2", [input.accountId, assetId]);

    if (!accountAssetsData) {
      return res.status(422).json({
        error: "No funds available for this order"
      });
    }

    if (input.side === "sell" ? parseFloat(accountAssetsData.quantity) < input.quantity : parseFloat(accountAssetsData.quantity) < input.price) {
      return res.status(422).json({
        error: "Insufficient amount for this order"
      });
    }

    const ordersData = await connection.query("select * from ccca.order where account_id = $1 and market_id = $2 and side = $3", [input.accountId, input.marketId, input.side]);

    let totalAmout = 0;
    for (const orderData of ordersData) {
      totalAmout += input.side === "sell" ? parseFloat(orderData.quantity) : parseFloat(orderData.price);
    }

    if (input.side === "sell" ? parseFloat(accountAssetsData.quantity) < input.quantity + totalAmout : parseFloat(accountAssetsData.quantity) < input.price + totalAmout) {
      return res.status(422).json({
        error: "Insufficient amount for this order"
      });
    }

    const order = {
        orderId: crypto.randomUUID(),
        marketId: input.marketId,
        accountId: input.accountId,
        side: input.side,
        quantity: input.quantity,
        price: input.price,
        status: "open",
        timestamp: new Date()
    }

    await connection.query("insert into ccca.order (order_id, market_id, account_id, side, quantity, price, status, timestamp) values ($1, $2, $3, $4, $5, $6, $7, $8)", [order.orderId, order.marketId, order.accountId, order.side, order.quantity, order.price, order.status, order.timestamp]);

    res.json({
        orderId: order.orderId
    });
});

app.get("/orders/:orderId", async (req: Request, res: Response): Promise<any> => {
    const orderId = req.params.orderId;

    if (!isValidUUID(orderId)) {
      return res.status(422).json({
        error: "Invalid order"
      });
    }

    const [orderData] = await connection.query("select * from ccca.order where order_id = $1", [orderId]);

    if (!orderData) {
      return res.status(404).json({
        error: "No order found"
      });
    }

    const order = {
        orderId: orderData.order_id,
        marketId: orderData.market_id,
        accountId: orderData.account_id,
        side: orderData.side,
        quantity: parseFloat(orderData.quantity),
        price: parseFloat(orderData.price),
        status: orderData.status,
        timestamp: orderData.timestamp
    }

    res.json(order);
});

app.listen(3000);