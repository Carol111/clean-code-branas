import { Server } from "socket.io";
import { WebSocketHandlers } from "./WebSocketHandlers";
import GetDepth from "./GetDepth";

export function setupWebsocket(server: any, getDepth: GetDepth) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  new WebSocketHandlers(io, getDepth);
}
