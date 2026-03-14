import { Router, type IRouter, type Request, type Response } from "express";
import { createHash, randomBytes } from "crypto";
import { getDb } from "../lib/mongodb";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || "exampro_salt_2024";
  return createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.cookies?.auth_token || null;
}

router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.issues[0]?.message || "Invalid request" });
    return;
  }

  const { fullName, email, password, confirmPassword } = parsed.data;

  if (password !== confirmPassword) {
    res.status(400).json({ error: "password_mismatch", message: "Passwords do not match" });
    return;
  }

  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ error: "email_taken", message: "An account with this email already exists" });
    return;
  }

  const now = new Date();
  const result = await users.insertOne({
    fullName,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: now,
  });

  res.status(201).json({
    user: {
      id: result.insertedId.toString(),
      fullName,
      email: email.toLowerCase(),
      createdAt: now,
    },
    message: "Account created successfully",
  });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.issues[0]?.message || "Invalid request" });
    return;
  }

  const { email, password } = parsed.data;

  const db = await getDb();
  const users = db.collection("users");

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const sessions = db.collection("sessions");
  await sessions.insertOne({
    userId: user._id,
    token,
    createdAt: new Date(),
    expiresAt,
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  res.json({
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    },
    message: "Login successful",
  });
});

router.post("/logout", async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (token) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ token });
  }
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const db = await getDb();
  const session = await db.collection("sessions").findOne({ token });

  if (!session || session.expiresAt < new Date()) {
    res.clearCookie("auth_token");
    res.status(401).json({ error: "unauthorized", message: "Session expired" });
    return;
  }

  const user = await db.collection("users").findOne({ _id: session.userId });
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "User not found" });
    return;
  }

  res.json({
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  });
});

export default router;
