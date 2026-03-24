import AccountDAO from "./AccountDAO";
import { isValidUUID } from "./validateUUID";

export default class Deposit {
  constructor(readonly accountDAO: AccountDAO) {}

  async execute(
    accountId: string,
    assetId: string,
    quantity: number,
  ): Promise<any> {
    if (!isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountDAO.selectAccount(accountId);

    if (!accountData) throw new Error("Invalid account");
    if (!["BTC", "USD"].includes(assetId)) throw new Error("Invalid asset");
    if (quantity <= 0) throw new Error("Invalid quantity");

    const accountAssetData = await this.accountDAO.selectAccountAsset(
      accountId,
      assetId,
    );

    if (accountAssetData) {
      const newQuantity = parseFloat(accountAssetData.quantity) + quantity;

      await this.accountDAO.updateAccountAsset(newQuantity, accountId, assetId);

      return;
    }

    await this.accountDAO.insertAccountAsset(quantity, accountId, assetId);
  }
}
