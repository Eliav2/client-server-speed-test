import { useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "speed-test-backend";

export const useSocketIOServer = ({
  serverURL = "http://localhost:8080",
} = {}) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(serverURL)
  );
  const socket = socketRef.current;

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to TCP server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from TCP server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, [socket.connected]);

  return socket;
};
