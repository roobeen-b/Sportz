import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

if (!arcjetKey) {
  throw new Error("ARCJET_KEY is required");
}

if (!arcjetMode) {
  throw new Error("ARCJET_MODE is required");
}

export const httpArcjet = arcjet({
  key: arcjetKey,
  rules: [
    shield({ mode: arcjetMode }),
    detectBot({
      mode: arcjetMode,
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({ mode: arcjetMode, interval: "10s", max: 50 }),
  ],
});

export const wsArcjet = arcjet({
  key: arcjetKey,
  rules: [
    shield({ mode: arcjetMode }),
    detectBot({
      mode: arcjetMode,
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({ mode: arcjetMode, interval: "2s", max: 5 }),
  ],
});

export function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) return next();

    try {
      const decision = await httpArcjet.protect(req);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too many requests" });
        }
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch (error) {
      console.error("Arcjet middleware error:", error);
      return res.status(503).json({ error: "Service unavailable" });
    }
  };
}
