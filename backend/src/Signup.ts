import Account from "./Account";
import AccountDAO from "./AccountDAO";

export default class Signup {
  constructor(readonly accountDAO: AccountDAO) {}

  async execute(input: any): Promise<any> {
    const account = Account.create(
      input.name,
      input.email,
      input.document,
      input.password,
    );
    await this.accountDAO.insertAccount(account);
    return {
      accountId: account.accountId,
    };
  }
}
