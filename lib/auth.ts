import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  user: {
    additionalFields: {
      role: {
        type: ["STUDENT", "STAFF", "ADMIN"],
        required: false,
        defaultValue: "STUDENT",
        input: false,
        returned: true,
      },

      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
        returned: true,
      },
    },
  },
});