import bcrypt from "bcryptjs";

const SECRET_KEY =
  process.env.ADMIN_SESSION_SECRET || "dimension-street-secret-key-2026-auth-token";

export interface AdminSession {
  email: string;
  name: string;
  role: "superadmin" | "admin";
  exp: number; // timestamp in ms
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "customer" | "admin" | "superadmin";
  exp: number; // timestamp in ms
}

export const ADMIN_COOKIE_NAME = "ds_admin_session";
export const USER_COOKIE_NAME = "ds_user_session";

// Base64Url helper
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Generate HMAC key for WebCrypto
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Create signed token
export async function createSessionToken(
  session: Omit<AdminSession, "exp">,
  durationDays: number = 7
): Promise<string> {
  const exp = Date.now() + durationDays * 24 * 60 * 60 * 1000;
  const payload: AdminSession = { ...session, exp };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const key = await getCryptoKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${encodedPayload}.${signatureHex}`;
}

// Verify token
export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signatureHex] = token.split(".");
  if (!encodedPayload || !signatureHex) {
    return null;
  }

  try {
    const key = await getCryptoKey();
    const signatureBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(encodedPayload)
    );

    if (!isValid) return null;

    const decoded = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSession;
    if (!decoded.exp || decoded.exp < Date.now()) {
      return null; // Expired
    }

    return decoded;
  } catch (err) {
    return null;
  }
}

// Check admin credentials
export function validateAdminCredentials(
  emailInput: string,
  passInput: string
): { isValid: boolean; user?: { name: string; email: string; role: "superadmin" } } {
  const email = (emailInput || "").trim().toLowerCase();
  const pass = (passInput || "").trim();

  // Primary Requested Admin:
  // Admin email: tawhideh.b10@gmail.com
  // Pass: Tawhide44
  if (email === "tawhideh.b10@gmail.com" && pass === "Tawhide44") {
    return {
      isValid: true,
      user: {
        name: "Tawhide H.",
        email: "tawhideh.b10@gmail.com",
        role: "superadmin",
      },
    };
  }

  // Fallback admin account
  if (email === "admin@dimensionstreet.com" && (pass === "Tawhide44" || pass === "admin123")) {
    return {
      isValid: true,
      user: {
        name: "Lox Admin",
        email: "admin@dimensionstreet.com",
        role: "superadmin",
      },
    };
  }

  return { isValid: false };
}

// Create signed customer/user token
export async function createUserSessionToken(
  session: Omit<UserSession, "exp">,
  durationDays: number = 30
): Promise<string> {
  const exp = Date.now() + durationDays * 24 * 60 * 60 * 1000;
  const payload: UserSession = { ...session, exp };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const key = await getCryptoKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload)
  );

  const signatureHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${encodedPayload}.${signatureHex}`;
}

// Verify signed customer/user token
export async function verifyUserSessionToken(
  token: string | undefined | null
): Promise<UserSession | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signatureHex] = token.split(".");
  if (!encodedPayload || !signatureHex) {
    return null;
  }

  try {
    const key = await getCryptoKey();
    const signatureBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(encodedPayload)
    );

    if (!isValid) return null;

    const decoded = JSON.parse(base64UrlDecode(encodedPayload)) as UserSession;
    if (!decoded.exp || decoded.exp < Date.now()) {
      return null; // Expired
    }

    return decoded;
  } catch (err) {
    return null;
  }
}

// Password hashing helpers
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainText, salt);
}

export async function comparePassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainText, hashedPassword);
}

