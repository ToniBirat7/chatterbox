import { Router, type Request, type Response } from "express";
import { createUser, loginUser } from "../controller/auth.js";
import { authenticateJWTHTTP } from "../middleware/middleware.js";
import {
  getPrivateChats,
  deletePrivateChat,
  updatePrivateChat,
} from "../controller/privateChatApi.js";
import { getGroupChat } from "../controller/groupChatApi.js";

const authRouter = Router();
authRouter.post("/create-user", createUser);
authRouter.post("/login", loginUser);

const apiRouter = Router();
apiRouter.use(authenticateJWTHTTP);

apiRouter.get("/pchat/:selectedUserId", getPrivateChats);
apiRouter.delete("/pchat/:messageId", deletePrivateChat);
apiRouter.patch("/pchat/:messageId", updatePrivateChat);

apiRouter.get("/gchat/:roomId", getGroupChat);

const healthRouter = Router();
healthRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export { authRouter, apiRouter, healthRouter };
