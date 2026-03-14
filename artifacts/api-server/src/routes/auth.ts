import { Router, type IRouter, type Request, type Response } from "express";
import { createHmac } from "crypto";

const router: IRouter = Router();

const ADMIN_EMAIL = "infocheelee01@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";
const SESSION_SECRET = process.env.SESSION_SECRET || "examcore_secret_key_2024";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function signToken(payload: object): string {
  const data = JSON.stringify(payload);
  const sig = createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64url") + "." + sig;
}

function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const data = Buffer.from(b64, "base64url").toString("utf8");
    const expected = createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
    if (expected !== sig) return null;
    const payload = JSON.parse(data);
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.cookies?.auth_token || null;
}

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res.status(400).json({ error: "validation_error", message: "Email and password are required" });
    return;
  }

  if (email.toLowerCase().trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    return;
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = signToken({
    id: "admin",
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    exp: expiresAt.getTime(),
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  res.json({
    user: { id: "admin", fullName: ADMIN_NAME, email: ADMIN_EMAIL },
    message: "Login successful",
  });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.clearCookie("auth_token");
    res.status(401).json({ error: "unauthorized", message: "Session expired or invalid" });
    return;
  }

  res.json({
    id: payload.id,
    fullName: payload.fullName,
    email: payload.email,
  });
});

export default router;
