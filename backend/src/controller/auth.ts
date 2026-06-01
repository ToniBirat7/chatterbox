import type { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  NODE_ENV,
} from "../config/index.js";
import { prisma } from "../lib/prisma.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as CreateUserBody;

  if (!body) {
    res.status(400).json({ msg: "No body provided" });
    return;
  }

  const { fname, lname, email, password, address } = body;

  if (!fname?.trim() || fname.trim().length < 2) {
    res.status(400).json({ msg: "First name must be at least 2 characters" });
    return;
  }
  if (!lname?.trim() || lname.trim().length < 2) {
    res.status(400).json({ msg: "Last name must be at least 2 characters" });
    return;
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ msg: "Invalid email address" });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ msg: "Password must be at least 6 characters" });
    return;
  }
  if (!address?.trim() || address.trim().length < 5) {
    res.status(400).json({ msg: "Address must be at least 5 characters" });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ msg: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fname: fname.trim(),
        lname: lname.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        address: address.trim(),
      },
    });

    res.status(201).json({ msg: "User created successfully", user: { email: user.email } });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as LoginBody;

  if (!body) {
    res.status(400).json({ msg: "No body provided" });
    return;
  }

  const { email, password } = body;

  if (!email || !password) {
    res.status(400).json({ msg: "Email and password are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(400).json({ msg: "User does not exist" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ msg: "Invalid credentials" });
      return;
    }

    const payload: UserJwtPayload = {
      id: user.id,
      name: `${user.fname} ${user.lname}`,
    };

    const options: SignOptions = {
      expiresIn: (JWT_EXPIRES_IN || "1d") as string & SignOptions["expiresIn"],
      algorithm: "HS256",
    };

    const token = jwt.sign(payload, JWT_SECRET, options);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: "Logged in successfully", email: user.email });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
};
