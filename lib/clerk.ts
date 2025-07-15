// lib/clerk.ts
import { Clerk } from "@clerk/clerk-sdk-node";

export const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY! });
