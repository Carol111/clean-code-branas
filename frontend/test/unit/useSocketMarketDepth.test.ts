import { renderHook, waitFor } from "@testing-library/react";
import { useSocketMarketDepth } from "../../src/hooks/useSocketMarketDepth";
import { io as ioClient } from "socket.io-client";

jest.mock("socket.io-client");

describe("useSocketMarketDepth Hook", () => {
  let mockSocket: any;
  let mockIo: jest.Mock;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    mockIo = ioClient as jest.Mock;
    mockIo.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      (call) => call[0] === "connect",
    )[1];
    connectHandler();

    await waitFor(() => {
      expect(result.current.connected).toBe(true);
    });
  });

  test("should emit subscribe with marketId", async () => {
    renderHook(() => useSocketMarketDepth("BTC/USD"));

    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "connect",
    )[1];
    connectHandler();

    expect(mockSocket.emit).toHaveBeenCalledWith("subscribe", {
      marketId: "BTC/USD",
    });
  });

  test("should update depth on depth event", async () => {
    const { result } = renderHook(() => useSocketMarketDepth("BTC/USD"));

    const depthHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "depth",
    )[1];

    const mockDepth = {
      marketId: "BTC/USD",
      depth: {
        buys: [{ price: 84000, quantity: 1.5 }],
        sells: [{ price: 85000, quantity: 0.5 }],
      },
    };

    depthHandler(mockDepth);

    await waitFor(() => {
      expect(result.current.depth).toEqual(mockDepth.depth);
    });
  });

  test("should handle errors", async () => {
    const { result } = renderHook(() => useSocketMarketDepth("BTC/USD"));

    const errorHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "error",
    )[1];

    errorHandler({ message: "Invalid market" });

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

    rerender({ marketId: "USD/BTC" });

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
