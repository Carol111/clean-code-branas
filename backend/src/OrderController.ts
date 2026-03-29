import HttpServer from "./HttpServer";
import GetOrder from "./GetOrder";
import PlaceOrder from "./PlaceOrder";

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
