import type { JwtPayload } from "jsonwebtoken";

declare global {
  interface UserJwtPayload extends JwtPayload {
    id: string;
    name: string;
  }

  interface CreateUserBody {
    fname: string;
    lname: string;
    email: string;
    password: string;
    address: string;
  }

  interface LoginBody {
    email: string;
    password: string;
  }

  interface Member {
    id: string;
    name: string;
    status: boolean;
    avatar: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserJwtPayload;
  }
}

export {};
