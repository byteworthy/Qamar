import { z } from "zod";
import { pgTable, text, timestamp, serial, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("free"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const processedStripeEvents = pgTable("processed_stripe_events", {
  eventId: text("event_id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  thought: text("thought").notNull(),
  distortions: jsonb("distortions").notNull().$type<string[]>(),
  reframe: text("reframe").notNull(),
  intention: text("intention").notNull(),
  practice: text("practice").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const sessionSchema = z.object({
  thought: z.string(),
  distortions: z.array(z.string()),
  reframe: z.string(),
  intention: z.string(),
  practice: z.string(),
  timestamp: z.number(),
});

export type SessionLocal = z.infer<typeof sessionSchema>;
