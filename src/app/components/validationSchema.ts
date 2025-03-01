import { z } from "zod";
import { AU_STATES } from "./constants";


export const addressSchema = z.object({
  postcode: z
    .string()
    .regex(/^\d{4}$/, "Postcode must be exactly 4 digits")
    .refine((val) => parseInt(val, 10) >= 200 && parseInt(val, 10) <= 9999, {
      message: "Postcode must be a valid Australian postcode (0200-9999)",
    }),
  suburb: z
    .string()
    .min(2, "Suburb is required")
    .max(100, "Suburb name too long"),
  state: z
    .string()
    .toUpperCase()
    .refine((val) => Object.keys(AU_STATES).includes(val), {
      message: `State must be one of ${Object.keys(AU_STATES).join(", ")}`,
    }),
});
