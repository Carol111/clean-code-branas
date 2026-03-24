import AccountDAO from "./AccountDAO";
import { isValidUUID } from "./validateUUID";

export default class GetAccount {
  constructor(readonly accountDAO: AccountDAO) {}

  async execute(accountId: string): Promise<any> {
    if (!isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountDAO.selectAccount(accountId);

    if (!accountData)
      throw Object.assign(new Error("Account not found"), { statusCode: 404 });

    const accountAssetsData =
      await this.accountDAO.selectAccountAssets(accountId);

    accountData.assets = [];
    for (const accountAssetData of accountAssetsData) {
      accountData.assets.push({
        assetId: accountAssetData.asset_id,
        quantity: parseFloat(accountAssetData.quantity),
      });
    }

    return accountData;
  }
}
