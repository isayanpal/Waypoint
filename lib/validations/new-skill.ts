import { z } from "zod";

export const newSkillSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.string().min(1).max(2000),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  timelineMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]),
});

export type NewSkillInput = z.infer<typeof newSkillSchema>;
