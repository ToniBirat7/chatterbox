import type { Socket } from "socket.io-client";

declare global {
  interface Member {
    id: string;
    name: string;
    status: boolean;
    avatar: string;
  }

  interface Message {
    id: string;
    text: string;
    sender: string;
    senderId: string;
    receiverId?: string;
    timestamp: Date | string;
  }

  interface GroupMessage {
    id: string;
    text: string;
    sender: string;
    senderId: string;
    receiver: string;
    timestamp: Date | string;
  }

  interface ServerToClientEvents {
    member: (memberData: Member | Member[]) => void;
    member_left: (data: { id: string }) => void;
    receive_message: (data: GroupMessage) => void;
    receive_private_message: (newMessage: Message) => void;
    message_error: (data: { error: string }) => void;
  }

  interface ClientToServerEvents {
    "join-room": (grpId: string) => void;
    send_private_message: (newMessage: Omit<Message, "senderId" | "receiverId">, receiverId: string) => void;
    send_message: (newMessage: Omit<GroupMessage, "senderId">, roomId: string) => void;
  }

  interface ChatWindowProps {
    selectedUser: Member;
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  }

  interface GroupChatWindowProps {
    selectedGroup: {
      id: string;
      name: string;
      avatar: string;
      memberCount: number;
    } | null;
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  }

  interface SocketContextType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
    members: Member[];
  }
}
