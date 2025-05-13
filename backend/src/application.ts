import crypto from "crypto";
import { selectAccountAsset, selectAccount, insertAccountAsset, updateAccountAsset, selectOrders, insertOrder, selectOrder } from "./resources";

function isValidUUID (uuid: string) {
  return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
}

export async function deposit (input: any) {
  if (!isValidUUID(input.accountId)) throw new Error("Invalid account");

  const accountData = await selectAccount(input.accountId);

  if (!accountData) throw new Error("Invalid account");
  if (!["BTC", "USD"].includes(input.assetId)) throw new Error("Invalid asset");
  if (input.quantity <= 0) throw new Error("Invalid quantity");

  const accountAssetData = await selectAccountAsset(input.accountId, input.assetId);

  if (accountAssetData) {
    const newQuantity = parseFloat(accountAssetData.quantity) + input.quantity;

    await updateAccountAsset(newQuantity, input.accountId, input.assetId);

    return;
  }

  await insertAccountAsset(input.quantity, input.accountId, input.assetId);
};

export async function withdraw (input: any) {
  if (!isValidUUID(input.accountId)) throw new Error("Invalid account");

  const accountData = await selectAccount(input.accountId);

  if (!accountData) throw new Error("Invalid account");
  if (!["BTC", "USD"].includes(input.assetId)) throw new Error("Invalid asset");
  if (input.quantity <= 0) throw new Error("Invalid quantity");

  const accountAssetData = await selectAccountAsset(input.accountId, input.assetId);

  if (!accountAssetData) throw new Error("No funds available for this asset");
  if (parseFloat(accountAssetData.quantity) < input.quantity) throw new Error("Insufficient amount for withdrawal");

  const newQuantity = parseFloat(accountAssetData.quantity) - input.quantity;

  await updateAccountAsset(newQuantity, input.accountId, input.assetId);
};

export async function placeOrder (input: any) {
  if (!isValidUUID(input.accountId)) throw new Error("Invalid account");

  const accountData = await selectAccount(input.accountId);

  if (!accountData) throw new Error("Invalid account");
  if (!["BTC/USD", "USD/BTC"].includes(input.marketId)) throw new Error("Invalid order");
  if (!["sell", "buy"].includes(input.side)) throw new Error("Invalid order");
  if (input.quantity <= 0) throw new Error("Invalid quantity");
  if (input.price <= 0) throw new Error("Invalid price");

  const assetsId = input.marketId.split("/");
  const assetId = input.side === "sell" ? assetsId[0] : assetsId[1];

  const accountAssetData = await selectAccountAsset(input.accountId, assetId);

  if (!accountAssetData) throw new Error("No funds available for this order");

  if (input.side === "sell" ? parseFloat(accountAssetData.quantity) < input.quantity : parseFloat(accountAssetData.quantity) < input.price) throw new Error("Insufficient amount for this order");

  const ordersData = await selectOrders(input.accountId, input.marketId, input.side);

  let totalAmout = 0;
  for (const orderData of ordersData) {
    totalAmout += input.side === "sell" ? parseFloat(orderData.quantity) : parseFloat(orderData.price);
  }

  if (input.side === "sell" ? parseFloat(accountAssetData.quantity) < input.quantity + totalAmout : parseFloat(accountAssetData.quantity) < input.price + totalAmout) throw new Error("Insufficient amount for this order");

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

  await insertOrder(order);

  return {
      orderId: order.orderId
  };
};

export async function getOrder (orderId: string) {
    if (!isValidUUID(orderId)) throw new Error("Invalid order");

    const orderData = await selectOrder(orderId);

    if (!orderData) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

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

    return order;
};