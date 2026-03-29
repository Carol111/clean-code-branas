import AccountRepository from "../../infra/repository/AccountRepository";
import { isValidUUID } from "../../domain/validateUUID";

export default class Withdraw {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<void> {
    const { accountId, assetId, quantity } = input;
    if (!isValidUUID(accountId)) throw new Error("Invalid account");

    const accountData = await this.accountRepository.selectAccount(accountId);

    if (!accountData) throw new Error("Invalid account");
    if (!["BTC", "USD"].includes(assetId)) throw new Error("Invalid asset");
    if (quantity <= 0) throw new Error("Invalid quantity");

    const accountAsset = await this.accountRepository.selectAccountAsset(
      accountId,
      assetId,
    );

    if (!accountAsset) throw new Error("Asset not found");

    accountAsset.withdraw(input.quantity);
    await this.accountRepository.updateAccountAsset(accountAsset);
  }
}

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
};
