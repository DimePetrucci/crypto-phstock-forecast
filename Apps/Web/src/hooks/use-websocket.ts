"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

type WsStatus = "connecting" | "connected" | "disconnected" | "error";

export function useMarketWebSocket(channel: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket(`${WS_BASE}/ws/market/${channel}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onmessage = (e) => {
      try { setLastMessage(JSON.parse(e.data)); } catch {}
    };
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("disconnected");
  }, [channel]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { status, lastMessage, sendMessage };
}
