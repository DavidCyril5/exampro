import { Router, type IRouter, type Request, type Response } from "express";
import { randomBytes } from "crypto";

const router: IRouter = Router();

const ADMIN_EMAIL = "infocheelee01@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";

const sessions = new Map<string, { expiresAt: Date }>();

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.cookies?.auth_token || null;
}

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: "validation_error", message: "Email and password are required" });
    return;
  }

  if (email.toLowerCase().trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  sessions.set(token, { expiresAt });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  res.json({
    user: {
      id: "admin",
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
    },
    message: "Login successful",
  });
});

router.post("/logout", async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (token) sessions.delete(token);
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", async (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    if (token) sessions.delete(token);
    res.clearCookie("auth_token");
    res.status(401).json({ error: "unauthorized", message: "Session expired" });
    return;
  }

  res.json({
    id: "admin",
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
  });
});

export default router;
