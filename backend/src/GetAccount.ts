import AccountDAO from "./AccountDAO";

export default class GetAccount {
  constructor (readonly accountDAO: AccountDAO) {

  }

  isValidUUID (uuid: string) {
    return uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  }

  async execute (accountId: string): Promise<any> {
    if (!this.isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountDAO.selectAccount(accountId);

    if (!accountData) throw Object.assign(new Error('Account not found'), { statusCode: 404 });

    const accountAssetsData = await this.accountDAO.selectAccountAssets(accountId);

    accountData.assets = [];
    for (const accountAssetData of accountAssetsData) {
        accountData.assets.push({ assetId: accountAssetData.asset_id, quantity: parseFloat(accountAssetData.quantity) });
    }

    return accountData;
  }
}