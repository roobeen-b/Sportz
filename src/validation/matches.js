import { z } from "zod";

// List matches query schema
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum(["scheduled", "live", "finished"]).optional(),
});

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

// Match ID param schema
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create match schema
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    startTime: z.string().refine(
      (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      { message: "Invalid ISO date string for startTime" },
    ),
    endTime: z.string().refine(
      (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      { message: "Invalid ISO date string for endTime" },
    ),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be after startTime",
        path: ["endTime"],
      });
    }
  });

// Update score schema
export const updateScoreSchema = z.object({
  homeScore: z.coerce
    .number()
    .int()
    .min(0, "Home score must be a non-negative integer"),
  awayScore: z.coerce
    .number()
    .int()
    .min(0, "Away score must be a non-negative integer"),
});
