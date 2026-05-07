import crypto from "crypto";
import path from "path";
import express from "express";
import helmet from "helmet";
import * as adminRepository from "../repositories/admin-repository.js";

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function toBoolean(value) {
  return value === "on" || value === "true" || value === "1";
}

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function requireAdmin(sessionStore) {
  return (req, res, next) => {
    if (req.session?.admin?.userId) {
      next();
      return;
    }
    res.redirect("/admin/login");
  };
}

function requireCsrf(sessionStore) {
  return (req, res, next) => {
    if (sessionStore.verifyCsrf(req)) {
      next();
      return;
    }

    if (req.session?.admin?.userId) {
      sessionStore.setFlash(req, res, {
        type: "error",
        message: "Your session could not be verified. Try again.",
      });
      res.redirect("/admin");
      return;
    }

    res.status(403).send("Invalid CSRF token.");
  };
}

function normalizeTimer(body) {
  return {
    name: body.name?.trim(),
    message: body.message?.trim(),
    interval_ms: toInteger(body.interval_ms, 60000),
    channel: body.channel?.trim(),
    enabled: toBoolean(body.enabled),
    live_only: toBoolean(body.live_only),
    sort_order: toInteger(body.sort_order, 0),
  };
}

function normalizeStreamer(body) {
  return {
    twitch_name: body.twitch_name?.trim(),
    twitch_id: body.twitch_id?.trim() || null,
    discord_name: body.discord_name?.trim() || null,
    discord_id: body.discord_id?.trim() || null,
    discord_channel_id: body.discord_channel_id?.trim() || null,
    enabled: toBoolean(body.enabled),
  };
}

function normalizeShoutout(body) {
  return {
    name: body.name?.trim(),
    message: body.message?.trim(),
    enabled: toBoolean(body.enabled),
  };
}

function normalizeFact(body) {
  return {
    content: body.content?.trim(),
    enabled: toBoolean(body.enabled),
    sort_order: toInteger(body.sort_order, 0),
  };
}

function normalizeTip(body) {
  return {
    title: body.title?.trim(),
    content: body.content?.trim(),
    enabled: toBoolean(body.enabled),
    sort_order: toInteger(body.sort_order, 0),
  };
}

function normalizeExercise(body) {
  return {
    exercise: body.exercise?.trim(),
    enabled: toBoolean(body.enabled),
    sort_order: toInteger(body.sort_order, 0),
  };
}

function validateRequired(fields) {
  const missing = fields.filter(([_, value]) => !value).map(([name]) => name);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }
}

function toUserMessage(error, fallback) {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error?.expose) {
    return error.message;
  }

  return fallback;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function createAdminServer({
  config,
  contentService,
  sessionStore,
  timerManager,
  twitchManager,
}) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "views"));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.urlencoded({ extended: false, limit: "50kb" }));
  app.use(sessionStore.middleware());

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
    });
  });

  app.get("/admin/login", async (req, res) => {
    if (req.query.start === "1") {
      const session = sessionStore.ensure(req, res);
      session.oauthState = crypto.randomUUID();
      sessionStore.commit(res, session);
      res.redirect(twitchManager.getAuthorizeUrl(session.oauthState));
      return;
    }

    if (req.session?.admin?.userId) {
      res.redirect("/admin");
      return;
    }

    res.render("login", {
      authStatus: await twitchManager.getAuthStatus(),
      csrfToken: sessionStore.getCsrfToken(req, res),
      flash: sessionStore.consumeFlash(req, res),
      formatDate,
    });
  });

  app.get("/auth/twitch/callback", async (req, res) => {
    const { code, state, error, error_description: errorDescription } = req.query;

    if (error) {
      sessionStore.setFlash(req, res, {
        type: "error",
        message: `Twitch login failed: ${errorDescription || error}`,
      });
      res.redirect("/admin/login");
      return;
    }

    if (!req.session?.oauthState || req.session.oauthState !== state) {
      sessionStore.setFlash(req, res, {
        type: "error",
        message: "OAuth state mismatch. Start the login flow again.",
      });
      res.redirect("/admin/login");
      return;
    }

    try {
      const user = await twitchManager.handleOAuthCallback(code);
      const session = sessionStore.rotate(req, res);
      session.admin = {
        userId: user.id,
        login: user.login,
        displayName: user.display_name,
      };
      session.oauthState = null;
      session.flash = {
        type: "success",
        message: `Connected Twitch bot account ${user.display_name}.`,
      };
      sessionStore.commit(res, session);
      res.redirect("/admin");
    } catch (errorObject) {
      console.error("[admin:twitch-callback]", errorObject);
      sessionStore.setFlash(req, res, {
        type: "error",
        message: toUserMessage(errorObject, "Twitch login failed. Check server logs for details."),
      });
      res.redirect("/admin/login");
    }
  });

  app.post("/admin/logout", requireAdmin(sessionStore), requireCsrf(sessionStore), (req, res) => {
    sessionStore.destroy(req, res);
    res.redirect("/admin/login");
  });

  app.get("/admin", requireAdmin(sessionStore), async (req, res) => {
    await contentService.reload();
    res.render("dashboard", {
      adminUser: req.session.admin,
      authStatus: await twitchManager.getAuthStatus(),
      content: contentService.getAll(),
      counts: await contentService.getDiagnosticsCounts(),
      csrfToken: sessionStore.getCsrfToken(req, res),
      flash: sessionStore.consumeFlash(req, res),
      formatDate,
      runtimeConnected: Boolean(twitchManager.apiClient && twitchManager.chatClient),
    });
  });

  async function handleMutation(req, res, action, successMessage) {
    try {
      await action();
      await timerManager.handleContentReload();
      sessionStore.setFlash(req, res, {
        type: "success",
        message: successMessage,
      });
    } catch (error) {
      console.error("[admin:mutation]", error);
      sessionStore.setFlash(req, res, {
        type: "error",
        message: toUserMessage(error, "Unable to save changes. Check server logs for details."),
      });
    }

    res.redirect("/admin");
  }

  app.post("/admin/timers", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const timer = normalizeTimer(req.body);
      validateRequired([
        ["name", timer.name],
        ["message", timer.message],
        ["channel", timer.channel],
      ]);
      await adminRepository.createTimer(timer);
    }, "Timer created.");
  });

  app.post("/admin/timers/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const timer = normalizeTimer(req.body);
      validateRequired([
        ["name", timer.name],
        ["message", timer.message],
        ["channel", timer.channel],
      ]);
      await adminRepository.updateTimer(req.params.id, timer);
    }, "Timer updated.");
  });

  app.post("/admin/timers/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, () => adminRepository.deleteTimer(req.params.id), "Timer deleted.");
  });

  app.post("/admin/streamers", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const streamer = normalizeStreamer(req.body);
      validateRequired([["twitch_name", streamer.twitch_name]]);
      await adminRepository.createStreamerNotification(streamer);
    }, "Streamer notification created.");
  });

  app.post("/admin/streamers/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const streamer = normalizeStreamer(req.body);
      validateRequired([["twitch_name", streamer.twitch_name]]);
      await adminRepository.updateStreamerNotification(req.params.id, streamer);
    }, "Streamer notification updated.");
  });

  app.post("/admin/streamers/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, () => adminRepository.deleteStreamerNotification(req.params.id), "Streamer notification deleted.");
  });

  app.post("/admin/shoutouts", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const shoutout = normalizeShoutout(req.body);
      validateRequired([
        ["name", shoutout.name],
        ["message", shoutout.message],
      ]);
      await adminRepository.createCustomShoutout(shoutout);
    }, "Custom shoutout created.");
  });

  app.post("/admin/shoutouts/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const shoutout = normalizeShoutout(req.body);
      validateRequired([
        ["name", shoutout.name],
        ["message", shoutout.message],
      ]);
      await adminRepository.updateCustomShoutout(req.params.id, shoutout);
    }, "Custom shoutout updated.");
  });

  app.post("/admin/shoutouts/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, () => adminRepository.deleteCustomShoutout(req.params.id), "Custom shoutout deleted.");
  });

  app.post("/admin/facts", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const fact = normalizeFact(req.body);
      validateRequired([["content", fact.content]]);
      await adminRepository.createFact(fact);
    }, "Fact created.");
  });

  app.post("/admin/facts/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const fact = normalizeFact(req.body);
      validateRequired([["content", fact.content]]);
      await adminRepository.updateFact(req.params.id, fact);
    }, "Fact updated.");
  });

  app.post("/admin/facts/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, () => adminRepository.deleteFact(req.params.id), "Fact deleted.");
  });

  app.post("/admin/tips", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const tip = normalizeTip(req.body);
      validateRequired([
        ["title", tip.title],
        ["content", tip.content],
      ]);
      await adminRepository.createTip(tip);
    }, "Tip created.");
  });

  app.post("/admin/tips/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const tip = normalizeTip(req.body);
      validateRequired([
        ["title", tip.title],
        ["content", tip.content],
      ]);
      await adminRepository.updateTip(req.params.id, tip);
    }, "Tip updated.");
  });

  app.post("/admin/tips/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, () => adminRepository.deleteTip(req.params.id), "Tip deleted.");
  });

  app.post("/admin/exercises", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const exercise = normalizeExercise(req.body);
      validateRequired([["exercise", exercise.exercise]]);
      await adminRepository.createExercise(exercise);
    }, "Exercise created.");
  });

  app.post("/admin/exercises/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const exercise = normalizeExercise(req.body);
      validateRequired([["exercise", exercise.exercise]]);
      await adminRepository.updateExercise(req.params.id, exercise);
    }, "Exercise updated.");
  });

  app.post("/admin/exercises/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, () => adminRepository.deleteExercise(req.params.id), "Exercise deleted.");
  });

  return app;
}
