import AccountAsset from "../../domain/AccountAsset";
import AccountRepository from "../../infra/repository/AccountRepository";
import { isValidUUID } from "../../domain/validateUUID";

export default class Deposit {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<void> {
    if (!isValidUUID(input.accountId)) throw new Error("Invalid account");

    const accountData = await this.accountRepository.selectAccount(
      input.accountId,
    );

    if (!accountData) throw new Error("Invalid account");
    if (!["BTC", "USD"].includes(input.assetId))
      throw new Error("Invalid asset");
    if (input.quantity <= 0) throw new Error("Invalid quantity");

    const currentAccountAsset = await this.accountRepository.selectAccountAsset(
      input.accountId,
      input.assetId,
    );

    if (currentAccountAsset) {
      currentAccountAsset.deposit(input.quantity);

      await this.accountRepository.updateAccountAsset(currentAccountAsset);

      return;
    }

    const accountAsset = new AccountAsset(
      input.accountId,
      input.assetId,
      input.quantity,
    );

    await this.accountRepository.insertAccountAsset(accountAsset);
  }
}

type Input = {
  accountId: string;
  assetId: string;
  quantity: number;
};
