import { validateCpf } from "./validateCpf";
import { validatePassword } from "./validatePassword";

export default class Account {
  constructor(
    readonly accountId: string,
    readonly name: string,
    readonly email: string,
    readonly document: string,
    readonly password: string,
  ) {
    if (!this.isValidName(name)) throw new Error("Invalid name");
    if (!this.isValidEmail(email)) throw new Error("Invalid email");
    if (!validateCpf(document)) throw new Error("Invalid document");
    if (!validatePassword(password)) throw new Error("Invalid password");
  }

  static create(
    name: string,
    email: string,
    document: string,
    password: string,
  ) {
    const accountId = crypto.randomUUID();
    return new Account(accountId, name, email, document, password);
  }

  isValidName(name: string) {
    return name.match(/[a-zA-Z] [a-zA-Z]+/);
  }

  isValidEmail(email: string) {
    return email.match(/^(.+)\@(.+)$/);
  }
}
