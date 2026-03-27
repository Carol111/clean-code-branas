import AccountRepository from "./AccountRepository";
import { isValidUUID } from "./validateUUID";

export default class GetAccount {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<Output> {
    if (!isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountRepository.selectAccount(accountId);

    if (!accountData)
      throw Object.assign(new Error("Account not found"), { statusCode: 404 });

    const accountAssetsData =
      await this.accountRepository.selectAccountAssets(accountId);

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
        assetId: accountAssetData.assetId,
        quantity: accountAssetData.getQuantity(),
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
