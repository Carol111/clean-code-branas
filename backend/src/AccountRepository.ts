import Account from "./Account";
import AccountAsset from "./AccountAsset";
import DatabaseConnection from "./DatabaseConnection";

export default interface AccountRepository {
  insertAccount(account: Account): Promise<void>;
  selectAccount(accountId: string): Promise<Account>;
  selectAccountAssets(accountId: string): Promise<AccountAsset[]>;
  selectAccountAsset(
    accountId: string,
    assetId: string,
  ): Promise<AccountAsset | null>;
  updateAccountAsset(accountAsset: AccountAsset): Promise<void>;
  insertAccountAsset(accountAsset: AccountAsset): Promise<void>;
}

export class AccountRepositoryDatabase implements AccountRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async insertAccount(account: Account): Promise<void> {
    await this.connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ],
    );
  }

  async selectAccount(accountId: string): Promise<Account> {
    const [accountData] = await this.connection.query(
      "select * from ccca.account where account_id = $1",
      [accountId],
    );

    return new Account(
      accountData.account_id,
      accountData.name,
      accountData.email,
      accountData.document,
      accountData.password,
    );
  }

  async selectAccountAssets(accountId: string): Promise<AccountAsset[]> {
    const accountAssetsData = await this.connection.query(
      "select * from ccca.account_asset where account_id = $1",
      [accountId],
    );

    const accountAssets: AccountAsset[] = [];
    for (const accountAssetData of accountAssetsData) {
      accountAssets.push(
        new AccountAsset(
          accountAssetData.account_id,
          accountAssetData.asset_id,
          parseFloat(accountAssetData.quantity),
        ),
      );
    }
    return accountAssets;
  }

  async selectAccountAsset(
    accountId: string,
    assetId: string,
  ): Promise<AccountAsset | null> {
    const [accountAssetData] = await this.connection.query(
      "select * from ccca.account_asset where account_id = $1 and asset_id = $2",
      [accountId, assetId],
    );

    if (!accountAssetData) return null;
    return new AccountAsset(
      accountAssetData.account_id,
      accountAssetData.asset_id,
      parseFloat(accountAssetData.quantity),
    );
  }

  async updateAccountAsset(accountAsset: AccountAsset): Promise<void> {
    await this.connection.query(
      "update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3",
      [
        accountAsset.getQuantity(),
        accountAsset.accountId,
        accountAsset.assetId,
      ],
    );
  }

  async insertAccountAsset(accountAsset: AccountAsset): Promise<void> {
    await this.connection.query(
      "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
      [
        accountAsset.accountId,
        accountAsset.assetId,
        accountAsset.getQuantity(),
      ],
    );
  }
}
