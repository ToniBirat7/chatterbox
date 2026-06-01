const BASE = import.meta.env["VITE_API_URL"] as string ?? "http://localhost:3000";

export const PRIVATE_CHAT_API_URL = `${BASE}/api/v1/pchat`;
export const GROUP_CHAT_API_URL = `${BASE}/api/v1/gchat`;
export const AUTH_URL = `${BASE}/auth`;
export const GLOBAL_ROOM = "_chat_room";
