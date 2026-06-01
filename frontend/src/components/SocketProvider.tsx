import React, { type ReactNode, useState, useEffect } from "react";
import useSocket from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import { GLOBAL_ROOM } from "../consts";

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  members: [],
});

export const SocketProvider: React.FC<{ children: ReactNode }> = (props) => {
  const [members, setMembers] = useState<Member[]>([]);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    const handleConnect = () => {
      socket.emit("join-room", GLOBAL_ROOM);
    };

    const handleMember = (memberData: Member | Member[]) => {
      const incoming = Array.isArray(memberData) ? memberData : [memberData];

      setMembers((prev) => {
        const map = new Map(prev.map((m) => [m.id, m]));
        incoming.forEach((m) => map.set(m.id, m));
        return Array.from(map.values());
      });
    };

    const handleMemberLeft = ({ id }: { id: string }) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    };

    const handleConnectError = (err: Error) => {
      if (err.message.includes("Authentication failed")) {
        navigate("/");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("member", handleMember);
    socket.on("member_left", handleMemberLeft);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("member", handleMember);
      socket.off("member_left", handleMemberLeft);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [socket, navigate]);

  return (
    <SocketContext.Provider value={{ socket, members }}>
      {props.children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => React.useContext(SocketContext);
