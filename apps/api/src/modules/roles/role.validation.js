import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(2),

  description: z
    .string()
    .trim()
    .optional(),

  permissions: z
    .array(z.string())
    .default([]),

  isActive: z.boolean().optional(),
});

export const updateRoleSchema =
  createRoleSchema.partial();