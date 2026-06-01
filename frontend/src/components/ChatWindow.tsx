import React, { useEffect, useState, useRef } from "react";
import NoChat from "./NoChat";
import { PRIVATE_CHAT_API_URL } from "../consts";

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [totalChatCount, setTotalChatCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch message history when selected user changes
  useEffect(() => {
    const controller = new AbortController();
    setMessages([]);
    setError(null);
    setIsLoading(true);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${PRIVATE_CHAT_API_URL}/${selectedUser.id}`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const json = await res.json() as { data: Message[]; count: number };
        setMessages(json.data);
        setTotalChatCount(json.count);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Failed to load messages. Try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMessages();

    return () => {
      controller.abort();
    };
  }, [selectedUser.id]);

  // Listen for incoming private messages — filter to current conversation only
  useEffect(() => {
    const handlePrivateMessage = (newMessage: Message) => {
      // Accept messages from selected user OR our own echo TO selected user
      const fromSelectedUser = newMessage.senderId === selectedUser.id;
      const myEchoToSelected = newMessage.sender === "user" && newMessage.receiverId === selectedUser.id;
      if (!fromSelectedUser && !myEchoToSelected) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    };

    socket.on("receive_private_message", handlePrivateMessage);
    return () => {
      socket.off("receive_private_message", handlePrivateMessage);
    };
  }, [socket, selectedUser.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const newMessage: Omit<Message, "senderId" | "receiverId"> = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      sender: "user",
      timestamp: new Date(),
    };

    socket.emit("send_private_message", newMessage, selectedUser.id);
    setInputValue("");
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-main">
      {selectedUser ? (
        <>
          {/* Header */}
          <div className="chat-header">
            <div className="flex items-center gap-3">
              <div className="avatar">{selectedUser.avatar}</div>
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedUser.name}</h2>
                <p className="text-xs text-gray-400">
                  {selectedUser.status ? "Active now" : "Offline"}
                </p>
                <p className="text-xs text-gray-400">Total messages: {totalChatCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors" aria-label="Call">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors" aria-label="Video call">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-list">
            {isLoading && (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            {error && (
              <div className="text-center py-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {!isLoading && !error && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-gray-500 text-sm">No messages yet. Say hi!</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className="flex flex-col gap-1">
                  <div className={message.sender === "user" ? "message-sent" : "message-received"}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <span className={`text-xs text-gray-500 px-2 ${message.sender === "user" ? "text-left" : "text-right"}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Aa"
              className="chat-input flex-1"
              maxLength={2000}
            />
            <button
              type="submit"
              className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors"
              aria-label="Send message"
              disabled={!inputValue.trim()}
            >
              <svg className="w-6 h-6 text-gray-400 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16985749 C3.34915502,0.9 2.40734225,0.8429026 1.77946707,1.31768134 C0.994623095,1.95734473 0.837654326,3.0467841 1.15159189,3.98936818 L3.03521743,10.4303611 C3.03521743,10.5874585 3.19218622,10.7445559 3.50612381,10.7445559 L16.6915026,11.5300428 C16.6915026,11.5300428 17.1624089,11.5300428 17.1624089,12.0013349 C17.1624089,12.4726271 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            </button>
          </form>
        </>
      ) : (
        <NoChat />
      )}
    </div>
  );
};

export default ChatWindow;
