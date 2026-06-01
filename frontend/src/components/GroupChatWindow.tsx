import React, { useEffect, useState, useRef } from "react";
import NoChat from "./NoChat";
import { GROUP_CHAT_API_URL, GLOBAL_ROOM } from "../consts";

const GroupChatWindow: React.FC<GroupChatWindowProps> = ({ selectedGroup, socket }) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [totalChatCount, setTotalChatCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming group messages
  useEffect(() => {
    const handleReceiveMessage = (grpMsg: GroupMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === grpMsg.id)) return prev;
        return [...prev, grpMsg];
      });
    };

    socket?.on("receive_message", handleReceiveMessage);
    return () => {
      socket?.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  // Fetch message history when group selected
  useEffect(() => {
    if (!selectedGroup) return;

    const controller = new AbortController();
    setMessages([]);
    setError(null);
    setIsLoading(true);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${GROUP_CHAT_API_URL}/${GLOBAL_ROOM}`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const json = await res.json() as { data: GroupMessage[]; count: number };
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
    return () => { controller.abort(); };
  }, [selectedGroup]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || !selectedGroup) return;

    const newMessage: Omit<GroupMessage, "senderId"> = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text,
      sender: "user",
      receiver: "_chat_room",
      timestamp: new Date(),
    };

    socket?.emit("send_message", newMessage, GLOBAL_ROOM);
    setInputValue("");
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-main">
      {selectedGroup ? (
        <>
          {/* Header */}
          <div className="chat-header">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#3a3a3a] rounded-full flex items-center justify-center text-white font-bold text-sm relative">
                {selectedGroup.avatar}
                <div className="absolute -bottom-1 -right-1 bg-[#1a1a1a] rounded-full px-1.5 py-0.5 border border-[#3a3a3a]">
                  <span className="text-xs text-gray-400">{selectedGroup.memberCount}</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedGroup.name}</h2>
                <p className="text-xs text-gray-400">{selectedGroup.memberCount} members</p>
                <p className="text-xs text-gray-400">Total messages: {totalChatCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors"
                aria-label="Show members"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <div className={`flex-1 flex flex-col ${showMembers ? "border-r border-[#3a3a3a]" : ""}`}>
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
                    <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                  </div>
                )}
                {messages.map((message) => {
                  const isMyMessage = message.sender === "user";
                  const senderInitials = isMyMessage
                    ? "ME"
                    : message.sender.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        {!isMyMessage && (
                          <div className="flex items-center gap-2 px-2">
                            <div className="w-6 h-6 bg-[#3a3a3a] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {senderInitials}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{message.sender}</span>
                          </div>
                        )}
                        <div className={isMyMessage ? "message-sent" : "message-received"}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <span className={`text-xs text-gray-500 px-2 ${isMyMessage ? "text-right" : "text-left"}`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="input-area">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Message in group..."
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
            </div>

            {/* Members Panel */}
            {showMembers && (
              <div className="w-64 bg-[#1a1a1a] flex flex-col">
                <div className="px-4 py-3 border-b border-[#3a3a3a]">
                  <h3 className="text-white font-semibold">Group Members</h3>
                  <p className="text-xs text-gray-400 mt-1">{selectedGroup.memberCount} online</p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <NoChat />
      )}
    </div>
  );
};

export default GroupChatWindow;
