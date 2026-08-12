import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

export const createStudentSchema =
  z.object({
    admissionNumber: z
      .string()
      .trim()
      .min(1)
      .max(30),

    firstName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    middleName: optionalString,

    lastName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    gender: z.enum([
      "Male",
      "Female",
    ]),

    dateOfBirth: z
      .string()
      .optional()
      .or(z.literal("")),

    email: z
      .string()
      .email()
      .optional()
      .or(z.literal("")),

    phone: optionalString,

    address: optionalString,

    stateOfOrigin: optionalString,

    nationality: optionalString,

    bloodGroup: z
      .enum([
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ])
      .optional(),

    genotype: z
      .enum([
        "AA",
        "AS",
        "AC",
        "SS",
        "SC",
        "CC",
      ])
      .optional(),

    class: z
      .string()
      .optional()
      .or(z.literal("")),

    parent: z
      .string()
      .optional()
      .or(z.literal("")),

    admissionDate: z
      .string()
      .optional()
      .or(z.literal("")),

    status: z
      .enum([
        "active",
        "inactive",
        "graduated",
        "withdrawn",
      ])
      .optional(),
  });

export const updateStudentSchema =
  createStudentSchema.partial();