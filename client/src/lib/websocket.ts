import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export function useWebSocket(url?: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    // Construct WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = url || `${protocol}//${window.location.host}/ws`;

    // Create WebSocket connection
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        console.log("WebSocket message received:", message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Cannot send message:", message);
    }
  };

  const subscribe = (channel: string) => {
    sendMessage({ type: "subscribe", data: { channel } });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
  };
}

// Hook for real-time attendance updates
export function useAttendanceUpdates() {
  const { lastMessage, subscribe, isConnected } = useWebSocket();
  const [attendanceUpdates, setAttendanceUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      subscribe("attendance");
    }
  }, [isConnected, subscribe]);

  useEffect(() => {
    if (lastMessage?.type === "attendance_update") {
      setAttendanceUpdates(prev => [lastMessage.data, ...prev.slice(0, 9)]); // Keep last 10 updates
    }
  }, [lastMessage]);

  return {
    attendanceUpdates,
    isConnected,
  };
}

// Hook for real-time exception alerts
export function useExceptionAlerts() {
  const { lastMessage, subscribe, isConnected } = useWebSocket();
  const [exceptionAlerts, setExceptionAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      subscribe("exceptions");
    }
  }, [isConnected, subscribe]);

  useEffect(() => {
    if (lastMessage?.type === "exception_alert") {
      setExceptionAlerts(prev => [lastMessage.data, ...prev.slice(0, 4)]); // Keep last 5 alerts
    }
  }, [lastMessage]);

  return {
    exceptionAlerts,
    isConnected,
  };
}
