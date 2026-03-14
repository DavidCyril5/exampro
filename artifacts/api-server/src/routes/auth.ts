import { Router, type IRouter, type Request, type Response } from "express";
import { createHash, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + process.env.PASSWORD_SALT || "exampro_salt_2024").digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = req.cookies?.auth_token;
  return cookie || null;
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

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "email_taken", message: "An account with this email already exists" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    fullName,
    email: email.toLowerCase(),
    passwordHash,
  }).returning();

  res.status(201).json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
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

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
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
      id: user.id,
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
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
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

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.token, token)).limit(1);
  if (!session || session.expiresAt < new Date()) {
    res.clearCookie("auth_token");
    res.status(401).json({ error: "unauthorized", message: "Session expired" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  });
});

export default router;
