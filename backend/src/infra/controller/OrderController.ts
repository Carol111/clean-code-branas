import HttpServer from "../http/HttpServer";
import GetOrder from "../../application/usecase/GetOrder";
import PlaceOrder from "../../application/usecase/PlaceOrder";

export default class OrderController {
  static config(
    httpServer: HttpServer,
    placeOrder: PlaceOrder,
    getOrder: GetOrder,
  ) {
    httpServer.route(
      "post",
      "/place_order",
      async (params: any, body: any): Promise<any> => {
        const output = await placeOrder.execute(body);
        return output;
      },
    );

    httpServer.route(
      "get",
      "/orders/:orderId",
      async (params: any, body: any): Promise<any> => {
        const output = await getOrder.execute(params.orderId);
        return output;
      },
    );
  }
}
