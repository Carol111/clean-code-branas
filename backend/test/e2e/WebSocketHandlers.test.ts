import { Server } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { createServer, Server as HttpServer } from "http";
import { WebSocketHandlers } from "../../src/infra/websocket/WebSocketHandlers";
import orderEventEmitter from "../../src/application/event/OrderEventEmitter";
import Signup from "../../src/application/usecase/Signup";
import Deposit from "../../src/application/usecase/Deposit";
import PlaceOrder from "../../src/application/usecase/PlaceOrder";
import GetDepth from "../../src/application/usecase/GetDepth";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { OrderRepositoryDatabase } from "../../src/infra/repository/OrderRepository";
import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";

describe("WebSocketHandlers", () => {
  let httpServer: HttpServer;
  let io: Server;
  let client: ClientSocket;
  let port: number;
  let signup: Signup;
  let deposit: Deposit;
  let placeOrder: PlaceOrder;
  let getDepth: GetDepth;
  let accountId: string;
  let connection: DatabaseConnection;

  beforeEach(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    connection = new PgPromiseAdapter(process.env.DATABASE_TEST_URL!);
    await connection.query("BEGIN");

    const accountRepository = new AccountRepositoryDatabase(connection);
    const orderRepository = new OrderRepositoryDatabase(connection);
    signup = new Signup(accountRepository);
    deposit = new Deposit(accountRepository);
    placeOrder = new PlaceOrder(accountRepository, orderRepository);
    getDepth = new GetDepth(orderRepository);

    const outputSignup = await signup.execute({
      name: "John Doe BTC",
      email: "john.doe.btc@gmail.com",
      document: "97456321558",
      password: "asdQWE123",
    });
    accountId = outputSignup.accountId;
    await deposit.execute({ accountId, assetId: "BTC", quantity: 10 });
    await placeOrder.execute({
      accountId: outputSignup.accountId,
      marketId: "BTC/USD",
      side: "sell",
      price: 84000,
      quantity: 2,
    });
    await placeOrder.execute({
      accountId: outputSignup.accountId,
      marketId: "BTC/USD",
      side: "sell",
      price: 85000,
      quantity: 2,
    });

    new WebSocketHandlers(io, getDepth);

    await new Promise<void>((resolve) => {
      const srv = httpServer.listen(0, () => {
        port = (srv.address() as any).port;
        resolve();
      });
    });
  });

  test("Should handle client subscription with socket.io-client", (done) => {
    client = ioClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });

    client.on("connect", () => {
      client.emit("subscribe", { marketId: "BTC/USD" });
    });

    client.on("depth", (payload: any) => {
      try {
        expect(payload).toEqual(
          expect.objectContaining({ marketId: "BTC/USD" }),
        );

        const room = io.of("/").adapter.rooms.get("market:BTC/USD");
        expect(room).toBeDefined();
        expect(room?.has(client.id as string)).toBe(true);
        done();
      } catch (err) {
        done(err);
      }
    });

    client.on("connect_error", done);
    client.on("error", done);
  });

  test("Should reject invalid market with socket.io-client", (done) => {
    client = ioClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });

    client.on("connect", () => {
      client.emit("subscribe", { marketId: "INVALID/XYZ" });
    });

    client.on("error", (payload: any) => {
      try {
        expect(payload).toEqual(
          expect.objectContaining({
            message: "Invalid market",
          }),
        );

        const room = io.of("/").adapter.rooms.get("market:INVALID/XYZ");
        expect(room).toBeUndefined();

        done();
      } catch (err) {
        done(err);
      }
    });

    client.on("depth", () => {
      done(new Error("Should not receive depth for invalid market"));
    });

    client.on("connect_error", done);
  });

  test("Should broadcast depth on order creation with socket.io-client", (done) => {
    client = ioClient(`http://localhost:${port}`, {
      transports: ["websocket"],
    });

    client.on("connect", async () => {
      client.emit("subscribe", { marketId: "BTC/USD" });
    });

    let initialDepthReceived = false;
    client.on("depth", async (payload: any) => {
      try {
        if (!initialDepthReceived) {
          expect(payload.depth.sells.length).toBe(2);

          const room = io.of("/").adapter.rooms.get("market:BTC/USD");
          expect(room).toBeDefined();
          expect(room?.has(client.id as string)).toBe(true);
          initialDepthReceived = true;

          await placeOrder.execute({
            accountId,
            marketId: "BTC/USD",
            side: "sell",
            price: 80000,
            quantity: 1,
          });
        } else {
          expect(payload.depth.sells.length).toBe(3);
          done();
        }
      } catch (err) {
        done(err);
      }
    });

    client.on("connect_error", done);
    client.on("error", done);

    const timeoutId = setTimeout(() => {
      if (!initialDepthReceived)
        done(new Error("Did not receive initial depth after subscribe"));
    }, 1000);

    clearTimeout(timeoutId);
  });

  afterEach(async () => {
    client?.close();
    await io.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    orderEventEmitter.removeAllListeners();
    await connection.query("ROLLBACK");
    await connection.close();
  });
});
