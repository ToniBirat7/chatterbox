import { useMemo } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = (import.meta.env["VITE_SOCKET_URL"] as string | undefined) ?? "http://localhost:3000";

const useSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  const socket = useMemo<Socket<ServerToClientEvents, ClientToServerEvents>>(
    () => io(SOCKET_URL, { transports: ["websocket"] }),
    []
  );
  return socket;
};

export default useSocket;
