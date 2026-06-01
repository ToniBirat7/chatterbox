import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const LIMIT = 50;

export const getGroupChat = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user!;
  const roomId = req.params["roomId"];
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  if (!roomId) {
    res.status(400).json({ msg: "roomId is required" });
    return;
  }

  try {
    const [messages, count] = await Promise.all([
      prisma.groupMessage.findMany({
        where: { roomId },
        orderBy: { timestamp: "asc" },
        skip: offset,
        take: LIMIT,
        include: { sender: { select: { fname: true, lname: true } } },
      }),
      prisma.groupMessage.count({ where: { roomId } }),
    ]);

    const data = messages.map((msg) => ({
      id: msg.id,
      text: msg.message,
      sender:
        msg.senderId === currentUser.id
          ? "user"
          : `${msg.sender.fname} ${msg.sender.lname}`,
      senderId: msg.senderId,
      receiver: msg.roomId,
      timestamp: msg.timestamp,
    }));

    res.status(200).json({ data, count, offset, limit: LIMIT });
  } catch (err) {
    console.error("Error fetching group chat:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};
