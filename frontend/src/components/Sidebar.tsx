import React, { useState } from "react";

interface SidebarProps {
  selectedUser: Member | null;
  onSelectUser: (user: Member | null) => void;
  members: Member[];
  selectedGroup: {
    id: string;
    name: string;
    avatar: string;
    memberCount: number;
  } | null;
  onSelectGroup: (
    group: {
      id: string;
      name: string;
      avatar: string;
      memberCount: number;
    } | null
  ) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedUser,
  onSelectUser,
  members,
  selectedGroup,
  onSelectGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"personal" | "groups">("personal");

  const filteredUsers = members.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Single Group
  const groups = [
    {
      id: "global",
      name: "Global Chat",
      avatar: "GC",
      memberCount: filteredUsers.length,
      lastMessage: "Check DM",
    },
  ];

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#3a3a3a]">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-[#3a3a3a]">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="chat-input w-full"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3a3a3a] bg-[#1a1a1a]">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === "personal"
              ? "text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Personal</span>
            {filteredUsers.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#3a3a3a] rounded-full">
                {filteredUsers.length}
              </span>
            )}
          </div>
          {activeTab === "personal" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-200"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === "groups"
              ? "text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>Groups</span>
            {groups.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-[#3a3a3a] rounded-full">
                {groups.length}
              </span>
            )}
          </div>
          {activeTab === "groups" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "personal" ? (
          // Personal Chats
          filteredUsers.length > 0 ? (
            <div className="py-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onSelectGroup(null);
                  }}
                  className={`user-item ${
                    selectedUser?._id === user.id ? "active" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="avatar">{user.avatar}</div>
                    {user.status && (
                      <div className="status-online absolute bottom-0 right-0"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {user.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {user.status ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2a2a2a] rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-3-3h-1m-2.5-5a4 4 0 11-8 0 4 4 0 018 0zm-6.5 10H3v-2a3 3 0 013-3h1"
                  />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No personal chats</p>
              <p className="text-gray-500 text-sm mt-1">
                Start a conversation to see it here
              </p>
            </div>
          )
        ) : // Groups
        groups.length > 0 ? (
          <div className="py-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => {
                  onSelectGroup(group);
                  onSelectUser(null);
                }}
                className={`px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors border-b border-[#2a2a2a] ${
                  selectedGroup?.id === group.id ? "bg-[#2a2a2a]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#3a3a3a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {group.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#1a1a1a] rounded-full px-1.5 py-0.5 border border-[#3a3a3a]">
                      <span className="text-xs text-gray-400">
                        {group.memberCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {group.name}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {group.lastMessage}
                    </p>
                  </div>

                  <div className="text-gray-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2a2a2a] rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No groups yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Create or join a group to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
