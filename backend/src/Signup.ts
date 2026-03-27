import Account from "./Account";
import AccountRepository from "./AccountRepository";

export default class Signup {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: any): Promise<any> {
    const account = Account.create(
      input.name,
      input.email,
      input.document,
      input.password,
    );
    await this.accountRepository.insertAccount(account);
    return {
      accountId: account.accountId,
    };
  }
}
