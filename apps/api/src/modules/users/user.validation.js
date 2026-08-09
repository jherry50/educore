import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),

  email: z
    .string()
    .email()
    .transform((value) => value.trim().toLowerCase()),

  phone: z.string().trim().optional(),

  password: z.string().min(8),

  role: z.string().min(1),

  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(2).optional(),

  lastName: z.string().trim().min(2).optional(),

  email: z
    .string()
    .email()
    .transform((value) => value.trim().toLowerCase())
    .optional(),

  phone: z.string().trim().optional(),

  role: z.string().min(1).optional(),

  isActive: z.boolean().optional(),
});