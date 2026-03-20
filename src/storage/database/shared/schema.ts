import { pgTable, index, varchar, text, timestamp, serial, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Helper function for UUID
const gen_random_uuid = () => sql`gen_random_uuid()`;



export const animals = pgTable("animals", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	species: varchar({ length: 128 }).notNull(),
	description: text(),
	imageUrl: text("image_url"),
	habitat: varchar({ length: 255 }),
	diet: varchar({ length: 255 }),
	conservationStatus: varchar("conservation_status", { length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("animals_species_idx").using("btree", table.species.asc().nullsLast().op("text_ops")),
]);

export const favorites = pgTable("favorites", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	animalId: varchar("animal_id", { length: 36 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("favorites_animal_idx").using("btree", table.animalId.asc().nullsLast().op("text_ops")),
	index("favorites_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 128 }).notNull(),
	passwordHash: text("password_hash"),
	avatar: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

// 商品表
export const products = pgTable("products", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 50 }).notNull(),
	subcategory: varchar({ length: 50 }),
	imageUrl: text("image_url").notNull(),
	price: varchar({ length: 50 }),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("products_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("products_subcategory_idx").using("btree", table.subcategory.asc().nullsLast().op("text_ops")),
]);

// 买家展示表
export const showcases = pgTable("showcases", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	mediaUrl: text("media_url").notNull(),
	mediaType: varchar("media_type", { length: 20 }).notNull(),
	title: varchar({ length: 255 }),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// 年龄段内容表（管理员上传）
export const ageCategoryContent = pgTable("age_category_content", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	category: varchar({ length: 50 }).notNull(), // 年龄段类目：出生、一个月、两个月...18岁
	mediaUrl: text("media_url").notNull(), // 图片或视频URL
	mediaType: varchar("media_type", { length: 20 }).notNull(), // image 或 video
	description: text(), // 可选描述
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("age_category_content_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
]);
