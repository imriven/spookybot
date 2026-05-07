import db from "../config/dbConfig.js";
import config from "../config/appConfig.js";
import crypto from "crypto";

const TABLE_NAME = "twitch_auth_tokens";
const PROVIDER = "twitch";
const ENCRYPTION_PREFIX = "enc:v1";

function getEncryptionKey() {
  return crypto.createHash("sha256").update(config.tokenEncryptionKey, "utf8").digest();
}

function encryptSecret(value) {
  if (!value) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

function decryptSecret(value) {
  if (!value) {
    return value;
  }

  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return value;
  }

  const [, version, ivEncoded, tagEncoded, encryptedEncoded] = value.split(":");
  if (version !== "v1" || !ivEncoded || !tagEncoded || !encryptedEncoded) {
    throw new Error("Stored token has an invalid encryption format.");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivEncoded, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

function toRecord(user, tokenData, refreshError = null) {
  const expiresAt = tokenData.expiresIn
    ? new Date(Date.now() + tokenData.expiresIn * 1000)
    : null;

  return {
    provider: PROVIDER,
    twitch_user_id: user.id,
    login: user.login,
    display_name: user.display_name,
    access_token: encryptSecret(tokenData.accessToken),
    refresh_token: encryptSecret(tokenData.refreshToken),
    expires_at: expiresAt,
    scopes: JSON.stringify(tokenData.scope ?? []),
    token_type: tokenData.tokenType ?? null,
    obtainment_timestamp: tokenData.obtainmentTimestamp
      ? new Date(tokenData.obtainmentTimestamp)
      : new Date(),
    last_refresh_at: refreshError ? null : db.fn.now(),
    last_refresh_error: refreshError,
    updated_at: db.fn.now(),
  };
}

function parseScopes(scopes) {
  if (!scopes) {
    return [];
  }
  if (Array.isArray(scopes)) {
    return scopes;
  }
  if (typeof scopes === "string") {
    try {
      return JSON.parse(scopes);
    } catch {
      return [];
    }
  }
  return [];
}

export async function getStoredToken() {
  const row = await db(TABLE_NAME).where({ provider: PROVIDER }).first();
  if (!row) {
    return null;
  }

  return {
    provider: row.provider,
    twitchUserId: row.twitch_user_id,
    login: row.login,
    displayName: row.display_name,
    accessToken: decryptSecret(row.access_token),
    refreshToken: decryptSecret(row.refresh_token),
    expiresAt: row.expires_at,
    scopes: parseScopes(row.scopes),
    tokenType: row.token_type,
    obtainmentTimestamp: row.obtainment_timestamp,
    lastRefreshAt: row.last_refresh_at,
    lastRefreshError: row.last_refresh_error,
    updatedAt: row.updated_at,
  };
}

export async function saveToken(user, tokenData) {
  const record = toRecord(user, tokenData);
  await db(TABLE_NAME).insert(record).onConflict("provider").merge(record);
  return getStoredToken();
}

export async function updateTokenFromRefresh(user, tokenData) {
  const record = toRecord(user, tokenData);
  await db(TABLE_NAME).where({ provider: PROVIDER }).update(record);
  return getStoredToken();
}

export async function markRefreshError(errorMessage) {
  await db(TABLE_NAME)
    .where({ provider: PROVIDER })
    .update({
      last_refresh_error: errorMessage,
      updated_at: db.fn.now(),
    });
}

export async function clearRefreshError() {
  await db(TABLE_NAME)
    .where({ provider: PROVIDER })
    .update({
      last_refresh_error: null,
      updated_at: db.fn.now(),
    });
}
