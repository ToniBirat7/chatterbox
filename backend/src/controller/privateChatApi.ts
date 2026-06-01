import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const LIMIT = 50;

export const getPrivateChats = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user!;
  const selectedUserId = req.params["selectedUserId"];
  const offset = parseInt((req.query["offset"] as string) ?? "0", 10);

  if (!selectedUserId) {
    res.status(400).json({ msg: "selectedUserId is required" });
    return;
  }

  try {
    const [messages, count] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: selectedUserId },
            { senderId: selectedUserId, receiverId: currentUser.id },
          ],
        },
        orderBy: { timestamp: "asc" },
        skip: offset,
        take: LIMIT,
        include: { sender: { select: { fname: true, lname: true } } },
      }),
      prisma.conversation.count({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: selectedUserId },
            { senderId: selectedUserId, receiverId: currentUser.id },
          ],
        },
      }),
    ]);

    const data = messages.map((msg) => ({
      id: msg.id,
      text: msg.message,
      sender:
        msg.senderId === currentUser.id
          ? "user"
          : `${msg.sender.fname} ${msg.sender.lname}`,
      senderId: msg.senderId,
      timestamp: msg.timestamp,
    }));

    res.status(200).json({ data, count, offset, limit: LIMIT });
  } catch (err) {
    console.error("Error fetching private chats:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const deletePrivateChat = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user!;
  const messageId = req.params["messageId"];

  if (!messageId) {
    res.status(400).json({ msg: "messageId is required" });
    return;
  }

  try {
    const message = await prisma.conversation.findUnique({ where: { id: messageId } });

    if (!message) {
      res.status(404).json({ msg: "Message not found" });
      return;
    }

    if (message.senderId !== currentUser.id) {
      res.status(403).json({ msg: "Not authorized to delete this message" });
      return;
    }

    await prisma.conversation.delete({ where: { id: messageId } });
    res.status(200).json({ msg: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const updatePrivateChat = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user!;
  const messageId = req.params["messageId"];
  const { message } = req.body as { message: string };

  if (!messageId) {
    res.status(400).json({ msg: "messageId is required" });
    return;
  }

  if (!message?.trim()) {
    res.status(400).json({ msg: "Message content is required" });
    return;
  }

  if (message.trim().length > 2000) {
    res.status(400).json({ msg: "Message too long (max 2000 chars)" });
    return;
  }

  try {
    const existing = await prisma.conversation.findUnique({ where: { id: messageId } });

    if (!existing) {
      res.status(404).json({ msg: "Message not found" });
      return;
    }

    if (existing.senderId !== currentUser.id) {
      res.status(403).json({ msg: "Not authorized to edit this message" });
      return;
    }

    const updated = await prisma.conversation.update({
      where: { id: messageId },
      data: { message: message.trim() },
    });

    res.status(200).json({ msg: "Message updated", data: updated });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};
