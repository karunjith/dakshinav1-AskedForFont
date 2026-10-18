import crypto from "crypto";
import { cookies } from "next/headers";
import { User } from "./db";

const SESSION_COOKIE_NAME = "admin_session";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dakshina-architects-admin-panel-2026";

// SHA-256 password hashing
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Session signing payload helpers
interface SessionPayload {
  userId: string;
  username: string;
  role: User["role"];
  expires: number;
}

function signSession(payload: SessionPayload): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadStr)
    .digest("hex");
  return `${payloadStr}.${signature}`;
}

function verifySession(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadStr, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadStr)
    .digest("hex");

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf8")) as SessionPayload;
    if (Date.now() > payload.expires) {
      return null; // Expired session
    }
    return payload;
  } catch {
    return null;
  }
}

// Get the current user session (Server-side)
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return null;
  return verifySession(sessionCookie.value);
}

// Start a new session (30-day persistence, lax sameSite for rock-solid server actions)
export async function createSession(user: User) {
  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 30; // 30 Days session
  const expires = Date.now() + maxAge * 1000;
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    expires,
  };
  
  const token = signSession(payload);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    expires: new Date(expires),
    path: "/",
  });
}

// End a session
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Authorization check helper
export async function checkRolePermission(allowedRoles: User["role"][]): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (!allowedRoles.includes(session.role)) return null;
  return session;
}
