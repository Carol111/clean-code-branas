import HttpServer from "../http/HttpServer";
import Deposit from "../../application/usecase/Deposit";
import GetAccount from "../../application/usecase/GetAccount";
import Signup from "../../application/usecase/Signup";
import Withdraw from "../../application/usecase/Withdraw";

export default class AccountController {
  static config(
    httpServer: HttpServer,
    signup: Signup,
    getAccount: GetAccount,
    deposit: Deposit,
    withdraw: Withdraw,
  ) {
    httpServer.route(
      "post",
      "/signup",
      async (params: any, body: any): Promise<any> => {
        const output = await signup.execute(body);
        return output;
      },
    );

    httpServer.route(
      "get",
      "/accounts/:accountId",
      async (params: any, body: any): Promise<any> => {
        const output = await getAccount.execute(params.accountId);
        return output;
      },
    );

    httpServer.route(
      "post",
      "/deposit",
      async (params: any, body: any): Promise<any> => {
        await deposit.execute(body);
      },
    );

    httpServer.route(
      "post",
      "/withdraw",
      async (params: any, body: any): Promise<any> => {
        await withdraw.execute(body);
      },
    );
  }
}
