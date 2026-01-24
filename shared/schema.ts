import { z } from "zod";
import {
  pgTable,
  text,
  timestamp,
  serial,
  jsonb,
  integer,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

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

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    thought: text("thought").notNull(),
    distortions: jsonb("distortions").notNull().$type<string[]>(),
    reframe: text("reframe").notNull(),
    intention: text("intention").notNull(),
    practice: text("practice").notNull(),
    keyAssumption: text("key_assumption"),
    detectedState: text("detected_state"),
    anchor: text("anchor"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Foreign key to users table with cascade delete
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_fk",
    }).onDelete("cascade"),
    // Index on userId for fast history queries
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    // Index on createdAt for sorting
    createdAtIdx: index("sessions_created_at_idx").on(table.createdAt),
  }),
);

export const insightSummaries = pgTable(
  "insight_summaries",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    summary: text("summary").notNull(),
    reflectionCount: integer("reflection_count").notNull(),
    generatedAt: timestamp("generated_at").defaultNow(),
  },
  (table) => ({
    // Foreign key to users table with cascade delete
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "insight_summaries_user_fk",
    }).onDelete("cascade"),
    // Index on userId for fast queries
    userIdIdx: index("insight_summaries_user_id_idx").on(table.userId),
  }),
);

export const assumptionLibrary = pgTable(
  "assumption_library",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    assumptionLabel: text("assumption_label").notNull(),
    count: integer("count").default(1),
    lastSeenAt: timestamp("last_seen_at").defaultNow(),
  },
  (table) => ({
    // Foreign key to users table with cascade delete
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "assumption_library_user_fk",
    }).onDelete("cascade"),
    // Index on userId for fast queries
    userIdIdx: index("assumption_library_user_id_idx").on(table.userId),
  }),
);

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
