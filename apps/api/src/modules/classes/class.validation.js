import { z } from "zod";

export const createClassSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(50),

    code: z
      .string()
      .trim()
      .min(2)
      .max(20),

    section: z.enum([
      "Primary",
      "Secondary",
    ]),

    level: z
      .string()
      .trim()
      .min(2)
      .max(30),

    capacity: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(200)
      .optional(),

    classTeacher: z
      .string()
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .trim()
      .max(500)
      .optional()
      .or(z.literal("")),

    isActive: z
      .boolean()
      .optional(),
  });

export const updateClassSchema =
  createClassSchema.partial();