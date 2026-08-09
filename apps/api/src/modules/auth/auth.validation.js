import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("A valid email address is required")
    .transform((value) =>
      value.trim().toLowerCase()
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});