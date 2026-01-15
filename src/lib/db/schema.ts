import {
  pgTable,
  varchar,
  integer,
  timestamp,
  pgEnum,
  text,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// App-specific enums
export const visibilityEnum = pgEnum("visibility", ["public", "unlisted"]);
export const themeEnum = pgEnum("theme_preference", ["system", "light", "dark"]);
// Status presets stored as varchar for flexibility

// Users table (NextAuth compatible + app fields)
export const users = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    // App-specific fields
    username: varchar("username", { length: 30 }).unique(),
    batteryLevel: integer("battery_level").default(3).notNull(),
    statusText: varchar("status_text", { length: 30 }),
    statusPreset: varchar("status_preset", { length: 50 }),
    visibility: visibilityEnum("visibility").default("public").notNull(),
    themePreference: themeEnum("theme_preference").default("system").notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    lastActiveAt: timestamp("last_active_at", { mode: "date" }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("user_visibility_idx").on(table.visibility),
    index("user_updated_at_idx").on(table.updatedAt),
  ]
);

// NextAuth required tables
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("account_user_id_idx").on(table.userId),
  ]
);

export const sessions = pgTable(
  "session",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)]
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
