import crypto from "crypto";
import config from "../config/appConfig.js";

const COOKIE_NAME = config.sessionCookieSecure
  ? "__Host-spookybot_admin_session"
  : "spookybot_admin_session";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean)
    .reduce((accumulator, pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }
      const key = pair.slice(0, separatorIndex);
      const value = pair.slice(separatorIndex + 1);
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function sign(value) {
  return crypto.createHmac("sha256", config.sessionSecret).update(value).digest("hex");
}

function signaturesMatch(left, right) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function serializeCookie(value, expiresAt) {
  const segments = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))}`,
    `Expires=${expiresAt.toUTCString()}`,
  ];

  if (config.sessionCookieSecure) {
    segments.push("Secure");
  }

  return segments.join("; ");
}

export default class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = setInterval(() => this.pruneExpiredSessions(), CLEANUP_INTERVAL_MS);
    this.cleanupInterval.unref?.();
  }

  middleware() {
    return (req, _res, next) => {
      req.session = this.read(req);
      next();
    };
  }

  read(req) {
    const cookies = parseCookies(req.headers.cookie);
    const raw = cookies[COOKIE_NAME];
    if (!raw) {
      return null;
    }

    const [sessionId, signature] = raw.split(".");
    if (!sessionId || !signature || !signaturesMatch(sign(sessionId), signature)) {
      return null;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }

    session.lastSeenAt = Date.now();
    return session;
  }

  ensure(req, res) {
    if (req.session) {
      return req.session;
    }

    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      expiresAt: Date.now() + ONE_WEEK_MS,
      admin: null,
      flash: null,
      oauthState: null,
      csrfToken: crypto.randomBytes(32).toString("hex"),
    };

    this.sessions.set(sessionId, session);
    this.commit(res, session);
    req.session = session;
    return session;
  }

  commit(res, session) {
    session.expiresAt = Date.now() + ONE_WEEK_MS;
    const expiresAt = new Date(session.expiresAt);
    res.setHeader("Set-Cookie", serializeCookie(`${session.id}.${sign(session.id)}`, expiresAt));
  }

  clear(res) {
    res.setHeader("Set-Cookie", serializeCookie("", new Date(0)));
  }

  destroy(req, res) {
    if (req.session) {
      this.sessions.delete(req.session.id);
      req.session = null;
    }
    this.clear(res);
  }

  setFlash(req, res, flash) {
    const session = this.ensure(req, res);
    session.flash = flash;
    this.commit(res, session);
  }

  rotate(req, res) {
    const session = this.ensure(req, res);
    this.sessions.delete(session.id);
    session.id = crypto.randomUUID();
    session.lastSeenAt = Date.now();
    session.expiresAt = Date.now() + ONE_WEEK_MS;
    session.csrfToken = crypto.randomBytes(32).toString("hex");
    this.sessions.set(session.id, session);
    this.commit(res, session);
    req.session = session;
    return session;
  }

  getCsrfToken(req, res) {
    const session = this.ensure(req, res);
    if (!session.csrfToken) {
      session.csrfToken = crypto.randomBytes(32).toString("hex");
      this.commit(res, session);
    }
    return session.csrfToken;
  }

  verifyCsrf(req) {
    const submitted = req.body?._csrf;
    const expected = req.session?.csrfToken;
    if (!submitted || !expected) {
      return false;
    }
    return signaturesMatch(submitted, expected);
  }

  consumeFlash(req, res) {
    if (!req.session?.flash) {
      return null;
    }

    const flash = req.session.flash;
    req.session.flash = null;
    this.commit(res, req.session);
    return flash;
  }

  pruneExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
