import { pgTable, serial, timestamp, varchar, text, boolean, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 用户表
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    password_hash: text("password_hash"),
    avatar: text("avatar"),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [index("users_email_idx").on(table.email)]
);

// 动物表
export const animals = pgTable(
  "animals",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    species: varchar("species", { length: 128 }).notNull(),
    description: text("description"),
    image_url: text("image_url"),
    habitat: varchar("habitat", { length: 255 }),
    diet: varchar("diet", { length: 255 }),
    conservation_status: varchar("conservation_status", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [index("animals_species_idx").on(table.species)]
);

// 用户收藏表
export const favorites = pgTable(
  "favorites",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    animal_id: varchar("animal_id", { length: 36 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("favorites_user_idx").on(table.user_id),
    index("favorites_animal_idx").on(table.animal_id),
  ]
);

// 健康检查表（系统表，不要修改）
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// Zod schemas for validation
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  name: true,
  password_hash: true,
  avatar: true,
});

export const insertAnimalSchema = createCoercedInsertSchema(animals).pick({
  name: true,
  species: true,
  description: true,
  image_url: true,
  habitat: true,
  diet: true,
  conservation_status: true,
});

export const insertFavoriteSchema = createCoercedInsertSchema(favorites).pick({
  user_id: true,
  animal_id: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type Animal = typeof animals.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAnimal = z.infer<typeof insertAnimalSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
