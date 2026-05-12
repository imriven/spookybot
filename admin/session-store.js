import crypto from "crypto";
import config from "../config/appConfig.js";

const COOKIE_NAME = config.sessionCookieSecure
  ? "__Host-spookybot_admin_session"
  : "spookybot_admin_session";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_WEEK_SECONDS = Math.floor(ONE_WEEK_MS / 1000);
const REDIS_KEY_PREFIX = "admin_session:";

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
  constructor({ redisClient } = {}) {
    if (!redisClient) {
      throw new Error("SessionStore requires a Redis client.");
    }

    this.redisClient = redisClient;
  }

  getSessionKey(sessionId) {
    return `${REDIS_KEY_PREFIX}${sessionId}`;
  }

  async loadSession(sessionId) {
    const rawSession = await this.redisClient.get(this.getSessionKey(sessionId));
    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession);
  }

  async saveSession(session) {
    await this.redisClient.set(this.getSessionKey(session.id), JSON.stringify(session), {
      EX: ONE_WEEK_SECONDS,
    });
  }

  async deleteSession(sessionId) {
    await this.redisClient.del(this.getSessionKey(sessionId));
  }

  middleware() {
    return (req, _res, next) => {
      this.read(req)
        .then((session) => {
          req.session = session;
          next();
        })
        .catch(next);
    };
  }

  async read(req) {
    const cookies = parseCookies(req.headers.cookie);
    const raw = cookies[COOKIE_NAME];
    if (!raw) {
      return null;
    }

    const [sessionId, signature] = raw.split(".");
    if (!sessionId || !signature || !signaturesMatch(sign(sessionId), signature)) {
      return null;
    }

    const session = await this.loadSession(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      await this.deleteSession(sessionId);
      return null;
    }

    session.lastSeenAt = Date.now();
    return session;
  }

  async ensure(req, res) {
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

    await this.commit(res, session);
    req.session = session;
    return session;
  }

  async commit(res, session) {
    session.expiresAt = Date.now() + ONE_WEEK_MS;
    await this.saveSession(session);
    const expiresAt = new Date(session.expiresAt);
    res.setHeader("Set-Cookie", serializeCookie(`${session.id}.${sign(session.id)}`, expiresAt));
  }

  clear(res) {
    res.setHeader("Set-Cookie", serializeCookie("", new Date(0)));
  }

  async destroy(req, res) {
    if (req.session) {
      await this.deleteSession(req.session.id);
      req.session = null;
    }
    this.clear(res);
  }

  async setFlash(req, res, flash) {
    const session = await this.ensure(req, res);
    session.flash = flash;
    await this.commit(res, session);
  }

  async rotate(req, res) {
    const session = await this.ensure(req, res);
    const previousSessionId = session.id;
    await this.deleteSession(previousSessionId);
    session.id = crypto.randomUUID();
    session.lastSeenAt = Date.now();
    session.expiresAt = Date.now() + ONE_WEEK_MS;
    session.csrfToken = crypto.randomBytes(32).toString("hex");
    await this.commit(res, session);
    req.session = session;
    return session;
  }

  async getCsrfToken(req, res) {
    const session = await this.ensure(req, res);
    if (!session.csrfToken) {
      session.csrfToken = crypto.randomBytes(32).toString("hex");
      await this.commit(res, session);
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

  async consumeFlash(req, res) {
    if (!req.session?.flash) {
      return null;
    }

    const flash = req.session.flash;
    req.session.flash = null;
    await this.commit(res, req.session);
    return flash;
  }
}
