import { Server, Socket } from "socket.io";
import GetDepth from "./GetDepth";
import orderEventEmitter, { OrderEvent } from "./OrderEventEmitter";

export class WebSocketHandlers {
  private io: Server;
  private getDepth: GetDepth;
  private readonly PRECISION = 3;

  constructor(io: Server, getDepth: GetDepth) {
    this.io = io;
    this.getDepth = getDepth;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.io.on("connection", (socket: Socket) => {
      socket.on("subscribe", async (data: { marketId: string }) => {
        const { marketId } = data;
        const room = `market:${marketId}`;

        try {
          if (!["BTC/USD", "USD/BTC"].includes(marketId)) {
            socket.emit("error", { message: "Invalid market" });
            return;
          }

          socket.join(room);

          const depth = await this.getDepth.execute(marketId, this.PRECISION);
          socket.emit("depth", { marketId, depth });
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("unsubscribe", (data: { marketId: string }) => {
        const { marketId } = data;
        const room = `market:${marketId}`;
        socket.leave(room);
      });
    });

    orderEventEmitter.onOrderCreated(async (order: OrderEvent) => {
      const room = `market:${order.marketId}`;

      try {
        const depth = await this.getDepth.execute(
          order.marketId,
          this.PRECISION,
        );
        this.io.to(room).emit("depth", { marketId: order.marketId, depth });
      } catch (error: any) {
        console.error("Error broadcasting depth:", error.message);
      }
    });
  }
}
