import { Server } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { createServer, Server as HttpServer } from "http";
import { WebSocketHandlers } from "../../src/WebSocketHandlers";
import orderEventEmitter from "../../src/OrderEventEmitter";
import Signup from "../../src/Signup";
import Deposit from "../../src/Deposit";
import PlaceOrder from "../../src/PlaceOrder";
import GetDepth from "../../src/GetDepth";
import { AccountRepositoryDatabase } from "../../src/AccountRepository";
import { OrderRepositoryDatabase } from "../../src/OrderRepository";

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

  beforeEach(async () => {
    httpServer = createServer();
    io = new Server(httpServer);

    const accountRepository = new AccountRepositoryDatabase();
    const orderRepository = new OrderRepositoryDatabase();
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

  afterEach(async () => {
    client?.close();
    await io.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    orderEventEmitter.removeAllListeners();
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

    setTimeout(() => {
      if (!initialDepthReceived)
        done(new Error("Did not receive initial depth after subscribe"));
    }, 1000);
  });
});
