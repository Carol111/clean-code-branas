import pgp from "pg-promise";

export default interface AccountDAO {
  insertAccount (account: any): Promise<void>;
  selectAccount (accountId: string): Promise<any>;
  selectAccountAssets (accountId: string): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {
  async insertAccount (account: any) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.document, account.password]);
    await connection.$pool.end();
  }

  async selectAccount (accountId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
    await connection.$pool.end();
    return accountData;
  }

  async selectAccountAssets (accountId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const accountAssetsData = await connection.query("select * from ccca.account_asset where account_id = $1", [accountId]);
    await connection.$pool.end();
    return accountAssetsData;
  }
}

export class AccountDAOMemory implements AccountDAO {
  accounts: any = [];

  async insertAccount (account: any) {
    this.accounts.push(account);
  }

  async selectAccount (accountId: string) {
    const account = this.accounts.find((account: any) => account.accountId === accountId);

    return account;
  }

  async selectAccountAssets (accountId: string) {
    return [];
  }
}