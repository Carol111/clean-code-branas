import pgp from "pg-promise";
import Account from "./Account";
import AccountAsset from "./AccountAsset";

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
  async insertAccount(account: Account): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ],
    );
    await connection.$pool.end();
  }

  async selectAccount(accountId: string): Promise<Account> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountData] = await connection.query(
      "select * from ccca.account where account_id = $1",
      [accountId],
    );
    await connection.$pool.end();
    return new Account(
      accountData.account_id,
      accountData.name,
      accountData.email,
      accountData.document,
      accountData.password,
    );
  }

  async selectAccountAssets(accountId: string): Promise<AccountAsset[]> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const accountAssetsData = await connection.query(
      "select * from ccca.account_asset where account_id = $1",
      [accountId],
    );
    await connection.$pool.end();

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
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountAssetData] = await connection.query(
      "select * from ccca.account_asset where account_id = $1 and asset_id = $2",
      [accountId, assetId],
    );
    await connection.$pool.end();
    if (!accountAssetData) return null;
    return new AccountAsset(
      accountAssetData.account_id,
      accountAssetData.asset_id,
      parseFloat(accountAssetData.quantity),
    );
  }

  async updateAccountAsset(accountAsset: AccountAsset): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3",
      [
        accountAsset.getQuantity(),
        accountAsset.accountId,
        accountAsset.assetId,
      ],
    );
    await connection.$pool.end();
  }

  async insertAccountAsset(accountAsset: AccountAsset): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
      [
        accountAsset.accountId,
        accountAsset.assetId,
        accountAsset.getQuantity(),
      ],
    );
    await connection.$pool.end();
  }
}
