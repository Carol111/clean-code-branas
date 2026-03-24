import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { useSocketMarketDepth } from "./useSocketMarketDepth";
import { io as ioClient } from "socket.io-client";

vi.mock("socket.io-client", () => ({
  io: vi.fn(),
}));

describe("useSocketMarketDepth Hook", () => {
  let mockSocket: any;
  let mockIo: any;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };

    mockIo = ioClient as unknown as ReturnType<typeof vi.fn>;
    mockIo.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should connect and subscribe on mount", () => {
    renderHook(() => useSocketMarketDepth("BTC/USD"));

    expect(mockIo).toHaveBeenCalledWith("http://localhost:3000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
  });

  test("should set connected true on connect event", async () => {
    const { result } = renderHook(() => useSocketMarketDepth("BTC/USD"));

    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === "connect",
    )[1];

    act(() => {
      connectHandler();
    });

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });
  });

  test("should emit subscribe with marketId", async () => {
    renderHook(() => useSocketMarketDepth("BTC/USD"));

    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === "connect",
    )[1];

    act(() => {
      connectHandler();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith("subscribe", {
      marketId: "BTC/USD",
    });
  });

  test("should update depth on depth event", async () => {
    const { result } = renderHook(() => useSocketMarketDepth("BTC/USD"));

    const depthHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === "depth",
    )[1];

    const mockDepth = {
      marketId: "BTC/USD",
      depth: {
        buys: [{ price: 84000, quantity: 1.5 }],
        sells: [{ price: 85000, quantity: 0.5 }],
      },
    };

    act(() => {
      depthHandler(mockDepth);
    });

    await waitFor(() => {
      expect(result.current.depth).toEqual(mockDepth.depth);
    });
  });

  test("should handle errors", async () => {
    const { result } = renderHook(() => useSocketMarketDepth("BTC/USD"));

    const errorHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === "error",
    )[1];

    act(() => {
      errorHandler({ message: "Invalid market" });
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Invalid market");
    });
  });

  test("should disconnect on unmount", () => {
    const { unmount } = renderHook(() => useSocketMarketDepth("BTC/USD"));

    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith("unsubscribe", {
      marketId: "BTC/USD",
    });
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  test("should reconnect when marketId changes", async () => {
    const { rerender } = renderHook(
      ({ marketId }) => useSocketMarketDepth(marketId),
      { initialProps: { marketId: "BTC/USD" } },
    );

    const firstConnect = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === "connect",
    )[1];

    act(() => {
      firstConnect();
    });

    rerender({ marketId: "USD/BTC" });

    const connectCalls = mockSocket.on.mock.calls.filter(
      (call: any) => call[0] === "connect",
    );

    const secondConnect = connectCalls[connectCalls.length - 1][1];

    act(() => {
      secondConnect();
    });

    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith("unsubscribe", {
        marketId: "BTC/USD",
      });
      expect(mockSocket.emit).toHaveBeenCalledWith("subscribe", {
        marketId: "USD/BTC",
      });
    });
  });
});
