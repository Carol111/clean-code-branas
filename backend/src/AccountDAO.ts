import pgp from "pg-promise";

export default interface AccountDAO {
  insertAccount(account: any): Promise<void>;
  selectAccount(accountId: string): Promise<any>;
  selectAccountAssets(accountId: string): Promise<any>;
  selectAccountAsset(accountId: string, assetId: string): Promise<any>;
  updateAccountAsset(
    quantity: number,
    accountId: string,
    assetId: string,
  ): Promise<any>;
  insertAccountAsset(
    quantity: number,
    accountId: string,
    assetId: string,
  ): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {
  async insertAccount(account: any) {
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

  async selectAccount(accountId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountData] = await connection.query(
      "select * from ccca.account where account_id = $1",
      [accountId],
    );
    await connection.$pool.end();
    return accountData;
  }

  async selectAccountAssets(accountId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const accountAssetsData = await connection.query(
      "select * from ccca.account_asset where account_id = $1",
      [accountId],
    );
    await connection.$pool.end();
    return accountAssetsData;
  }

  async selectAccountAsset(accountId: string, assetId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountAssetData] = await connection.query(
      "select * from ccca.account_asset where account_id = $1 and asset_id = $2",
      [accountId, assetId],
    );
    await connection.$pool.end();
    return accountAssetData;
  }

  async updateAccountAsset(
    quantity: number,
    accountId: string,
    assetId: string,
  ) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "update ccca.account_asset set quantity = $1 where account_id = $2 and asset_id = $3",
      [quantity, accountId, assetId],
    );
    await connection.$pool.end();
  }

  async insertAccountAsset(
    quantity: number,
    accountId: string,
    assetId: string,
  ) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
      [accountId, assetId, quantity],
    );
    await connection.$pool.end();
  }
}
