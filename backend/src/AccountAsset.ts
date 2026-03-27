export default class AccountAsset {
  constructor(
    readonly accountId: string,
    readonly assetId: string,
    private quantity: number,
  ) {}

  deposit(quantity: number) {
    this.quantity += quantity;
  }

  withdraw(quantity: number) {
    if (this.quantity < quantity) throw new Error("Insufficient funds");
    this.quantity -= quantity;
  }

  getQuantity() {
    return this.quantity;
  }
}
