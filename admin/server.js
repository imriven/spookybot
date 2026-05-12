import crypto from "crypto";
import path from "path";
import express from "express";
import helmet from "helmet";
import { logInfo } from "../logger.js";
import * as adminRepository from "../repositories/admin-repository.js";
import {
  isValidTimerInterval,
  MAX_TIMER_INTERVAL_MS,
  MIN_TIMER_INTERVAL_MS,
} from "../config/runtime-limits.js";

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

function takeFirst(result) {
  return Array.isArray(result) ? (result[0] ?? null) : (result ?? null);
}

function getAdminActor(req) {
  return req.session?.admin?.login ?? req.session?.admin?.displayName ?? "unknown";
}

function summarizeTimer(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    name: record?.name,
    channel: record?.channel,
    enabled: record?.enabled,
    liveOnly: record?.live_only,
    intervalMs: record?.interval_ms,
  };
}

function summarizeStreamer(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    twitchName: record?.twitch_name,
    discordChannelId: record?.discord_channel_id,
    enabled: record?.enabled,
  };
}

function summarizeShoutout(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    name: record?.name,
    enabled: record?.enabled,
  };
}

function summarizeFact(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    enabled: record?.enabled,
    sortOrder: record?.sort_order,
  };
}

function summarizeTip(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    title: record?.title,
    enabled: record?.enabled,
    sortOrder: record?.sort_order,
  };
}

function summarizeExercise(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    enabled: record?.enabled,
    sortOrder: record?.sort_order,
  };
}

function summarizeChatCommand(record, fallbackId = null) {
  return {
    id: record?.id ?? fallbackId,
    name: record?.name,
    handler: record?.handler,
    enabled: record?.enabled,
    listed: record?.listed,
    requiresPrivilege: record?.requires_privilege,
  };
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
    (async () => {
      if (sessionStore.verifyCsrf(req)) {
        next();
        return;
      }

      if (req.session?.admin?.userId) {
        await sessionStore.setFlash(req, res, {
          type: "error",
          message: "Your session could not be verified. Try again.",
        });
        res.redirect(sanitizeReturnTo(req.body?._returnTo) || inferRedirectPath(req.path));
        return;
      }

      res.status(403).send("Invalid CSRF token.");
    })().catch(next);
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

function normalizeChatCommand(body) {
  return {
    name: body.name?.trim()?.toLowerCase(),
    handler: body.handler?.trim()?.toLowerCase(),
    response: body.response?.trim() || null,
    description: body.description?.trim() || null,
    usage: body.usage?.trim() || null,
    enabled: toBoolean(body.enabled),
    listed: toBoolean(body.listed),
    requires_privilege: toBoolean(body.requires_privilege),
    sort_order: toInteger(body.sort_order, 0),
  };
}

function validateRequired(fields) {
  const missing = fields.filter(([_, value]) => !value).map(([name]) => name);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }
}

function validateChatCommand(command) {
  validateRequired([
    ["name", command.name],
    ["handler", command.handler],
  ]);

  if (!CHAT_COMMAND_HANDLERS.has(command.handler)) {
    throw new ValidationError(`Unsupported command handler: ${command.handler}`);
  }

  if (["text", "template", "help"].includes(command.handler) && !command.response) {
    throw new ValidationError(`Response is required for ${command.handler} commands.`);
  }
}

function validateTimer(timer) {
  validateRequired([
    ["name", timer.name],
    ["message", timer.message],
    ["channel", timer.channel],
  ]);

  if (!isValidTimerInterval(timer.interval_ms)) {
    throw new ValidationError(
      `Interval ms must be a whole number between ${MIN_TIMER_INTERVAL_MS} and ${MAX_TIMER_INTERVAL_MS}.`,
    );
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

const DATASET_PAGES = [
  {
    key: "timers",
    path: "/admin/timers",
    label: "Timers",
    listKey: "timers",
    countKey: "timers",
    title: "Timers",
    description: "Recurring chat prompts, pacing, and live-only automation.",
    createTitle: "Create Timer",
    createNote: "Use this for recurring in-chat reminders and promo messages.",
    searchPlaceholder: "Filter timers by name, message, channel, interval, or status",
    emptyMessage: "No timers match that search.",
    recordsEmptyMessage: "No timers have been created yet.",
    guide: {
      summary: "Timers send recurring chat messages on an interval.",
      required: [
        "Name identifies the timer in admin and should stay unique.",
        "Message is the exact chat text the bot will post.",
        "Channel is the Twitch channel where the timer should speak.",
      ],
      toggles: [
        "Enabled turns the timer on or off without deleting it.",
        "Live only restricts the timer to when the stream is live.",
      ],
      extras: [
        "Interval ms is the repeat cadence in milliseconds.",
        "Sort order controls display ordering in admin.",
      ],
    },
  },
  {
    key: "streamers",
    path: "/admin/streamers",
    label: "Streamers",
    listKey: "streamerNotifications",
    countKey: "streamerNotifications",
    title: "Tracked Streamers",
    description: "Discord live notifications for selected Twitch accounts.",
    createTitle: "Add Tracked Streamer",
    createNote: "Tie a Twitch user to the Discord identity and channel that should be pinged.",
    searchPlaceholder: "Filter streamers by Twitch or Discord identity",
    emptyMessage: "No tracked streamers match that search.",
    recordsEmptyMessage: "No tracked streamers have been added yet.",
    guide: {
      summary: "Tracked streamers drive Discord live notifications.",
      required: [
        "Twitch name is required and should match the streamer login exactly.",
      ],
      toggles: [
        "Enabled turns notifications on or off for that streamer.",
      ],
      extras: [
        "Twitch ID is optional but useful for stable identity.",
        "Discord ID and Discord channel ID are both needed to send a mention into Discord.",
      ],
    },
  },
  {
    key: "shoutouts",
    path: "/admin/shoutouts",
    label: "Shoutouts",
    listKey: "customShoutouts",
    countKey: "customShoutouts",
    title: "Custom Shoutouts",
    description: "Shortcut command aliases and bespoke shoutout copy.",
    createTitle: "Create Shoutout",
    createNote: "These become !name-style custom shoutout commands.",
    searchPlaceholder: "Filter shoutouts by command name or message",
    emptyMessage: "No shoutouts match that search.",
    recordsEmptyMessage: "No custom shoutouts have been created yet.",
    guide: {
      summary: "Custom shoutouts create direct !alias commands and also power the !so fallback.",
      required: [
        "Name becomes the command trigger without the leading !.",
        "Message is the full shoutout text sent to chat.",
      ],
      toggles: [
        "Enabled turns the shoutout on or off without removing it.",
      ],
      extras: [
        "Keep names short and lowercase to avoid confusion in chat.",
      ],
    },
  },
  {
    key: "facts",
    path: "/admin/facts",
    label: "Facts",
    listKey: "facts",
    countKey: "facts",
    title: "Facts",
    description: "Random fact rotation used by !spooky and automatic fact timers.",
    createTitle: "Add Fact",
    createNote: "Keep each fact self-contained so the timer can post it cleanly in chat.",
    searchPlaceholder: "Filter facts by content",
    emptyMessage: "No facts match that search.",
    recordsEmptyMessage: "No facts have been created yet.",
    guide: {
      summary: "Facts are used by the !spooky command and the automated fact timer.",
      required: [
        "Content is the exact fact text the bot may post.",
      ],
      toggles: [
        "Enabled controls whether the fact can be selected at runtime.",
      ],
      extras: [
        "Sort order only affects admin ordering, not random selection.",
      ],
    },
  },
  {
    key: "tips",
    path: "/admin/tips",
    label: "Tips",
    listKey: "tips",
    countKey: "tips",
    title: "Tips",
    description: "Daily rotating educational tips sent into Discord.",
    createTitle: "Add Tip",
    createNote: "Tips rotate in order, so sort order matters if you want a curated sequence.",
    searchPlaceholder: "Filter tips by title or content",
    emptyMessage: "No tips match that search.",
    recordsEmptyMessage: "No tips have been created yet.",
    guide: {
      summary: "Tips are posted into Discord on the tip schedule.",
      required: [
        "Title is the heading shown before the tip body.",
        "Tip content is the full Discord message body.",
      ],
      toggles: [
        "Enabled controls whether the tip participates in rotation.",
      ],
      extras: [
        "Sort order controls the rotation sequence when the bot steps through tips.",
      ],
    },
  },
  {
    key: "exercises",
    path: "/admin/exercises",
    label: "Exercises",
    listKey: "exercises",
    countKey: "exercises",
    title: "Exercises",
    description: "Daily challenge pool used for workout prompts in Discord.",
    createTitle: "Add Exercise",
    createNote: "Short, readable lines work best for the daily challenge post.",
    searchPlaceholder: "Filter exercises by text",
    emptyMessage: "No exercises match that search.",
    recordsEmptyMessage: "No exercises have been created yet.",
    guide: {
      summary: "Exercises feed the daily challenge post in Discord.",
      required: [
        "Exercise is the exact line that may appear in the challenge message.",
      ],
      toggles: [
        "Enabled controls whether the exercise can be randomly selected.",
      ],
      extras: [
        "Sort order only affects admin ordering, not random selection.",
      ],
    },
  },
  {
    key: "commands",
    path: "/admin/commands",
    label: "Commands",
    listKey: "chatCommands",
    countKey: "chatCommands",
    title: "Chat Commands",
    description: "Command registry for simple responses and system-backed chat actions.",
    createTitle: "Add Chat Command",
    createNote: "Use text/template handlers for content commands and system handlers for special bot behavior.",
    searchPlaceholder: "Filter commands by name, handler, response, or help text",
    emptyMessage: "No commands match that search.",
    recordsEmptyMessage: "No chat commands have been configured yet.",
    guide: {
      summary: "Commands define what chat triggers exist and which handler powers each one.",
      required: [
        "Command name is the trigger users type, like !discord or help.",
        "Handler selects the behavior the bot should run for that command.",
      ],
      toggles: [
        "Enabled turns the command on or off without deleting it.",
        "Listed controls whether the command appears in the commands output.",
        "Requires privilege restricts the command to broadcaster, mods, and VIPs.",
      ],
      extras: [
        "Response is used by text, template, and help handlers.",
        "Template responses can use {user}, {target}, and {channel}.",
        "Usage and description feed admin context and help output.",
      ],
    },
  },
];

const ADMIN_PAGES = [
  {
    key: "overview",
    path: "/admin",
    label: "Overview",
  },
  ...DATASET_PAGES.map(({ key, path, label, countKey }) => ({
    key,
    path,
    label,
    countKey,
  })),
];

const ALLOWED_RETURN_PATHS = new Set(ADMIN_PAGES.map((page) => page.path));
const CHAT_COMMAND_HANDLERS = new Set([
  "text",
  "template",
  "random_fact",
  "shoutout_lookup",
  "counter",
  "title_update",
  "help",
  "list",
]);

function getCountsFromContent(content) {
  return {
    timers: content.timers.length,
    streamerNotifications: content.streamerNotifications.length,
    customShoutouts: content.customShoutouts.length,
    facts: content.facts.length,
    tips: content.tips.length,
    exercises: content.exercises.length,
    chatCommands: content.chatCommands.length,
  };
}

function buildNavItems(counts, activePage) {
  return ADMIN_PAGES.map((page) => ({
    ...page,
    active: page.key === activePage,
    count: page.countKey ? counts[page.countKey] : null,
  }));
}

function normalizeSearchText(parts) {
  return parts
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function buildSearchText(pageKey, record) {
  switch (pageKey) {
    case "timers":
      return normalizeSearchText([
        record.name,
        record.message,
        record.channel,
        `${record.intervalMs} ms`,
        record.enabled ? "enabled" : "disabled",
        record.liveOnly ? "live only" : "always on",
      ]);
    case "streamers":
      return normalizeSearchText([
        record.twitchName,
        record.twitchId,
        record.discordName,
        record.discordId,
        record.discordChannelId,
      ]);
    case "shoutouts":
      return normalizeSearchText([record.name, record.message]);
    case "facts":
      return normalizeSearchText([record.content]);
    case "tips":
      return normalizeSearchText([record.title, record.content]);
    case "exercises":
      return normalizeSearchText([record.exercise]);
    case "commands":
      return normalizeSearchText([
        record.name,
        record.handler,
        record.response,
        record.description,
        record.usage,
        record.enabled ? "enabled" : "disabled",
        record.listed ? "listed" : "hidden",
        record.requiresPrivilege ? "privileged" : "public",
      ]);
    default:
      return "";
  }
}

function sanitizeReturnTo(returnTo) {
  if (typeof returnTo !== "string") {
    return null;
  }

  return ALLOWED_RETURN_PATHS.has(returnTo) ? returnTo : null;
}

function inferRedirectPath(pathname) {
  const matchedPage = DATASET_PAGES.find((page) => pathname.startsWith(page.path));
  return matchedPage?.path || "/admin";
}

async function buildViewModel({
  activePage,
  authStatus = null,
  contentService,
  csrfToken,
  flash,
  req,
  twitchTargetService,
}) {
  await contentService.reload();
  const content = contentService.getAll();
  const counts = getCountsFromContent(content);
  const activeTarget = twitchTargetService.getActiveTarget();

  return {
    activePage,
    activeTarget,
    adminUser: req.session.admin,
    availableTargets: twitchTargetService.listAvailableTargets(),
    authStatus,
    content,
    counts,
    csrfToken,
    datasetPages: DATASET_PAGES,
    flash,
    formatDate,
    navItems: buildNavItems(counts, activePage),
    targetTheme: activeTarget?.isTest ? "test" : "main",
  };
}

export default function createAdminServer({
  config,
  contentService,
  sessionStore,
  timerManager,
  twitchManager,
  twitchTargetService,
}) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.set("view engine", "ejs");
  app.set("views", path.join(process.cwd(), "views"));
  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", (_req, res) => `'nonce-${res.locals.cspNonce}'`],
          styleSrc: ["'self'", (_req, res) => `'nonce-${res.locals.cspNonce}'`],
        },
      },
    }),
  );
  app.use(express.urlencoded({ extended: false, limit: "50kb" }));
  app.use(sessionStore.middleware());

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
    });
  });

  app.get("/admin/login", async (req, res) => {
    if (req.query.start === "1") {
      const session = await sessionStore.ensure(req, res);
      session.oauthState = crypto.randomUUID();
      await sessionStore.commit(res, session);
      res.redirect(twitchManager.getAuthorizeUrl(session.oauthState));
      return;
    }

    if (req.session?.admin?.userId) {
      res.redirect("/admin");
      return;
    }

    res.render("login", {
      flash: await sessionStore.consumeFlash(req, res),
    });
  });

  app.get("/auth/twitch/callback", async (req, res) => {
    const { code, state, error, error_description: errorDescription } = req.query;

    if (error) {
      await sessionStore.setFlash(req, res, {
        type: "error",
        message: `Twitch login failed: ${errorDescription || error}`,
      });
      res.redirect("/admin/login");
      return;
    }

    if (!req.session?.oauthState || req.session.oauthState !== state) {
      await sessionStore.setFlash(req, res, {
        type: "error",
        message: "OAuth state mismatch. Start the login flow again.",
      });
      res.redirect("/admin/login");
      return;
    }

    try {
      const user = await twitchManager.handleOAuthCallback(code);
      const session = await sessionStore.rotate(req, res);
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
      await sessionStore.commit(res, session);
      res.redirect("/admin");
    } catch (errorObject) {
      console.error("[admin:twitch-callback]", errorObject);
      await sessionStore.setFlash(req, res, {
        type: "error",
        message: toUserMessage(errorObject, "Twitch login failed. Check server logs for details."),
      });
      res.redirect("/admin/login");
    }
  });

  app.post("/admin/logout", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await sessionStore.destroy(req, res);
    res.redirect("/admin/login");
  });

  app.post("/admin/target", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    const redirectTo = sanitizeReturnTo(req.body?._returnTo) || "/admin";
    const previousTarget = twitchTargetService.getActiveTarget();
    const nextTarget = twitchTargetService.resolveTarget(req.body?.target);

    if (!nextTarget) {
      await sessionStore.setFlash(req, res, {
        type: "error",
        message: "Invalid Twitch target selection. No runtime changes were applied.",
      });
      res.redirect(redirectTo);
      return;
    }

    if (nextTarget.key === previousTarget?.key) {
      try {
        await twitchTargetService.persistActiveTarget(nextTarget);
        await sessionStore.setFlash(req, res, {
          type: "success",
          message: `Active Twitch target remains ${nextTarget.username} / ${nextTarget.channelId}.`,
        });
      } catch (error) {
        console.error("[admin:target-persist]", error);
        await sessionStore.setFlash(req, res, {
          type: "error",
          message: toUserMessage(error, "Unable to persist the active Twitch target."),
        });
      }

      res.redirect(redirectTo);
      return;
    }

    try {
      await twitchManager.switchTarget(nextTarget);
      await twitchTargetService.persistActiveTarget(nextTarget);
      await sessionStore.setFlash(req, res, {
        type: "success",
        message: `Switched active Twitch target to ${nextTarget.username} / ${nextTarget.channelId}.`,
      });
    } catch (error) {
      console.error("[admin:target-switch]", error);

      try {
        if (previousTarget) {
          await twitchManager.switchTarget(previousTarget);
        }
      } catch (rollbackError) {
        console.error("[admin:target-switch:rollback]", rollbackError);
      }

      twitchTargetService.setActiveTarget(previousTarget);
      await sessionStore.setFlash(req, res, {
        type: "error",
        message: toUserMessage(
          error,
          `Unable to switch Twitch target. The runtime stayed on ${previousTarget.username} / ${previousTarget.channelId}.`,
        ),
      });
    }

    res.redirect(redirectTo);
  });

  app.get("/admin", requireAdmin(sessionStore), async (req, res) => {
    const csrfToken = await sessionStore.getCsrfToken(req, res);
    const flash = await sessionStore.consumeFlash(req, res);
    const authStatus = await twitchManager.getAuthStatus();
    const viewModel = await buildViewModel({
      activePage: "overview",
      contentService,
      csrfToken,
      flash,
      req,
      twitchTargetService,
    });

    res.render("admin-overview", {
      ...viewModel,
      authStatus,
      runtimeConnected: Boolean(twitchManager.apiClient && twitchManager.chatClient),
    });
  });

  DATASET_PAGES.forEach((page) => {
    app.get(page.path, requireAdmin(sessionStore), async (req, res) => {
      const csrfToken = await sessionStore.getCsrfToken(req, res);
      const flash = await sessionStore.consumeFlash(req, res);
      const viewModel = await buildViewModel({
        activePage: page.key,
        contentService,
        csrfToken,
        flash,
        req,
        twitchTargetService,
      });

      res.render("admin-dataset", {
        ...viewModel,
        page,
        records: viewModel.content[page.listKey].map((record) => ({
          ...record,
          searchText: buildSearchText(page.key, record),
        })),
      });
    });
  });

  async function handleMutation(req, res, action, successMessage, fallbackRedirect, logEvent = null) {
    const redirectTo = sanitizeReturnTo(req.body?._returnTo) || fallbackRedirect;

    try {
      const mutationDetails = await action();
      if (logEvent) {
        logInfo(logEvent, {
          actor: getAdminActor(req),
          ...mutationDetails,
        });
      }
      await timerManager.handleContentReload();
      await sessionStore.setFlash(req, res, {
        type: "success",
        message: successMessage,
      });
    } catch (error) {
      console.error("[admin:mutation]", error);
      await sessionStore.setFlash(req, res, {
        type: "error",
        message: toUserMessage(error, "Unable to save changes. Check server logs for details."),
      });
    }

    res.redirect(redirectTo);
  }

  app.post("/admin/timers", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const timer = normalizeTimer(req.body);
      validateTimer(timer);
      const created = takeFirst(await adminRepository.createTimer(timer));
      return summarizeTimer(created);
    }, "Timer created.", "/admin/timers", "admin.timer.created");
  });

  app.post("/admin/timers/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const timer = normalizeTimer(req.body);
      validateTimer(timer);
      const updated = takeFirst(await adminRepository.updateTimer(req.params.id, timer));
      return summarizeTimer(updated, req.params.id);
    }, "Timer updated.", "/admin/timers", "admin.timer.updated");
  });

  app.post("/admin/timers/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const existing = await adminRepository.getTimerById(req.params.id);
      await adminRepository.deleteTimer(req.params.id);
      return summarizeTimer(existing, req.params.id);
    }, "Timer deleted.", "/admin/timers", "admin.timer.deleted");
  });

  app.post("/admin/streamers", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const streamer = normalizeStreamer(req.body);
      validateRequired([["twitch_name", streamer.twitch_name]]);
      const created = takeFirst(await adminRepository.createStreamerNotification(streamer));
      return summarizeStreamer(created);
    }, "Streamer notification created.", "/admin/streamers", "admin.streamer.created");
  });

  app.post("/admin/streamers/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const streamer = normalizeStreamer(req.body);
      validateRequired([["twitch_name", streamer.twitch_name]]);
      const updated = takeFirst(await adminRepository.updateStreamerNotification(req.params.id, streamer));
      return summarizeStreamer(updated, req.params.id);
    }, "Streamer notification updated.", "/admin/streamers", "admin.streamer.updated");
  });

  app.post("/admin/streamers/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(
      req,
      res,
      async () => {
        const existing = await adminRepository.getStreamerNotificationById(req.params.id);
        await adminRepository.deleteStreamerNotification(req.params.id);
        return summarizeStreamer(existing, req.params.id);
      },
      "Streamer notification deleted.",
      "/admin/streamers",
      "admin.streamer.deleted",
    );
  });

  app.post("/admin/shoutouts", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const shoutout = normalizeShoutout(req.body);
      validateRequired([
        ["name", shoutout.name],
        ["message", shoutout.message],
      ]);
      const created = takeFirst(await adminRepository.createCustomShoutout(shoutout));
      return summarizeShoutout(created);
    }, "Custom shoutout created.", "/admin/shoutouts", "admin.shoutout.created");
  });

  app.post("/admin/shoutouts/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const shoutout = normalizeShoutout(req.body);
      validateRequired([
        ["name", shoutout.name],
        ["message", shoutout.message],
      ]);
      const updated = takeFirst(await adminRepository.updateCustomShoutout(req.params.id, shoutout));
      return summarizeShoutout(updated, req.params.id);
    }, "Custom shoutout updated.", "/admin/shoutouts", "admin.shoutout.updated");
  });

  app.post("/admin/shoutouts/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(
      req,
      res,
      async () => {
        const existing = await adminRepository.getCustomShoutoutById(req.params.id);
        await adminRepository.deleteCustomShoutout(req.params.id);
        return summarizeShoutout(existing, req.params.id);
      },
      "Custom shoutout deleted.",
      "/admin/shoutouts",
      "admin.shoutout.deleted",
    );
  });

  app.post("/admin/facts", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const fact = normalizeFact(req.body);
      validateRequired([["content", fact.content]]);
      const created = takeFirst(await adminRepository.createFact(fact));
      return summarizeFact(created);
    }, "Fact created.", "/admin/facts", "admin.fact.created");
  });

  app.post("/admin/facts/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const fact = normalizeFact(req.body);
      validateRequired([["content", fact.content]]);
      const updated = takeFirst(await adminRepository.updateFact(req.params.id, fact));
      return summarizeFact(updated, req.params.id);
    }, "Fact updated.", "/admin/facts", "admin.fact.updated");
  });

  app.post("/admin/facts/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const existing = await adminRepository.getFactById(req.params.id);
      await adminRepository.deleteFact(req.params.id);
      return summarizeFact(existing, req.params.id);
    }, "Fact deleted.", "/admin/facts", "admin.fact.deleted");
  });

  app.post("/admin/tips", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const tip = normalizeTip(req.body);
      validateRequired([
        ["title", tip.title],
        ["content", tip.content],
      ]);
      const created = takeFirst(await adminRepository.createTip(tip));
      return summarizeTip(created);
    }, "Tip created.", "/admin/tips", "admin.tip.created");
  });

  app.post("/admin/tips/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const tip = normalizeTip(req.body);
      validateRequired([
        ["title", tip.title],
        ["content", tip.content],
      ]);
      const updated = takeFirst(await adminRepository.updateTip(req.params.id, tip));
      return summarizeTip(updated, req.params.id);
    }, "Tip updated.", "/admin/tips", "admin.tip.updated");
  });

  app.post("/admin/tips/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const existing = await adminRepository.getTipById(req.params.id);
      await adminRepository.deleteTip(req.params.id);
      return summarizeTip(existing, req.params.id);
    }, "Tip deleted.", "/admin/tips", "admin.tip.deleted");
  });

  app.post("/admin/exercises", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const exercise = normalizeExercise(req.body);
      validateRequired([["exercise", exercise.exercise]]);
      const created = takeFirst(await adminRepository.createExercise(exercise));
      return summarizeExercise(created);
    }, "Exercise created.", "/admin/exercises", "admin.exercise.created");
  });

  app.post("/admin/exercises/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const exercise = normalizeExercise(req.body);
      validateRequired([["exercise", exercise.exercise]]);
      const updated = takeFirst(await adminRepository.updateExercise(req.params.id, exercise));
      return summarizeExercise(updated, req.params.id);
    }, "Exercise updated.", "/admin/exercises", "admin.exercise.updated");
  });

  app.post("/admin/exercises/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(
      req,
      res,
      async () => {
        const existing = await adminRepository.getExerciseById(req.params.id);
        await adminRepository.deleteExercise(req.params.id);
        return summarizeExercise(existing, req.params.id);
      },
      "Exercise deleted.",
      "/admin/exercises",
      "admin.exercise.deleted",
    );
  });

  app.post("/admin/commands", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const command = normalizeChatCommand(req.body);
      validateChatCommand(command);
      const created = takeFirst(await adminRepository.createChatCommand(command));
      return summarizeChatCommand(created);
    }, "Command created.", "/admin/commands", "admin.command.created");
  });

  app.post("/admin/commands/:id", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const command = normalizeChatCommand(req.body);
      validateChatCommand(command);
      const updated = takeFirst(await adminRepository.updateChatCommand(req.params.id, command));
      return summarizeChatCommand(updated, req.params.id);
    }, "Command updated.", "/admin/commands", "admin.command.updated");
  });

  app.post("/admin/commands/:id/delete", requireAdmin(sessionStore), requireCsrf(sessionStore), async (req, res) => {
    await handleMutation(req, res, async () => {
      const existing = await adminRepository.getChatCommandById(req.params.id);
      await adminRepository.deleteChatCommand(req.params.id);
      return summarizeChatCommand(existing, req.params.id);
    }, "Command deleted.", "/admin/commands", "admin.command.deleted");
  });

  return app;
}
