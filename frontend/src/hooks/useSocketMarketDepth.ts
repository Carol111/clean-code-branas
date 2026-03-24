import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocketMarketDepth(marketId: string) {
  const [depth, setDepth] = useState<{
    buys: Array<{ price: number; quantity: number }>;
    sells: Array<{ price: number; quantity: number }>;
  } | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", { marketId });
    });

    socket.on("depth", (data: { marketId: string; depth: any }) => {
      if (data.marketId === marketId) {
        setDepth(data.depth);
      }
    });

    socket.on("error", (data: { message: string }) => {
      console.error("WebSocket error:", data.message);
      setError(data.message);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.emit("unsubscribe", { marketId });
      socket.disconnect();
    };
  }, [marketId]);

  return { depth, connected, error };
}
