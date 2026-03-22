import { pgTable, index, varchar, text, timestamp, serial, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Helper function for UUID
const gen_random_uuid = () => sql`gen_random_uuid()`;

// 用户表（管理员和普通用户）
export const users = pgTable("users", {
	id: varchar({ length: 36 }).default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 128 }).notNull(),
	passwordHash: text("password_hash"),
	avatar: text(),
	role: varchar({ length: 20 }).default('user'), // admin 或 user
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

// 年龄段内容表（管理员上传，后台管理专用）
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
