import AccountDAO from "./AccountDAO";
import { isValidUUID } from "./validateUUID";

export default class GetAccount {
  constructor(readonly accountDAO: AccountDAO) {}

  async execute(accountId: string): Promise<Output> {
    if (!isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountDAO.selectAccount(accountId);

    if (!accountData)
      throw Object.assign(new Error("Account not found"), { statusCode: 404 });

    const accountAssetsData =
      await this.accountDAO.selectAccountAssets(accountId);

    const output: Output = {
      accountId: accountData.accountId,
      name: accountData.name,
      email: accountData.email,
      document: accountData.document,
      password: accountData.password,
      assets: [],
    };

    for (const accountAssetData of accountAssetsData) {
      output.assets.push({
        assetId: accountAssetData.asset_id,
        quantity: parseFloat(accountAssetData.quantity),
      });
    }

    return output;
  }
}

type Output = {
  accountId: string;
  name: string;
  email: string;
  document: string;
  password: string;
  assets: { assetId: string; quantity: number }[];
};
