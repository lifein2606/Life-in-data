import { pgTable, serial, timestamp, varchar, boolean, integer, numeric, jsonb, text, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 系统健康检查表（禁止删除）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 产品表
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    brands: jsonb("brands").notNull().default(sql`'[]'::jsonb`), // 品牌ID列表
    is_ingredient_product: boolean("is_ingredient_product").default(false).notNull(),
    total_output_ml: integer("total_output_ml").notNull(), // 出品总量标准
    ingredients: jsonb("ingredients").notNull().default(sql`'[]'::jsonb`), // 原料明细（JSON数组）
    package_specs: jsonb("package_specs").notNull().default(sql`'[]'::jsonb`), // 包装方案ID列表
    total_stock_ml: integer("total_stock_ml").default(0), // 总库存量
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("products_category_idx").on(table.category),
    index("products_name_idx").on(table.name),
  ]
);

// 原料表
export const ingredients = pgTable(
  "ingredients",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(), // 原料分类
    source: varchar("source", { length: 20 }).notNull().default('purchase'), // purchase 或 internal
    min_unit: varchar("min_unit", { length: 10 }).notNull(), // g, kg, ml, L
    purchase_spec: varchar("purchase_spec", { length: 64 }), // 进货规格
    purchase_price: numeric("purchase_price", { precision: 10, scale: 2 }), // 进货单价
    unit_price: numeric("unit_price", { precision: 10, scale: 4 }), // 最小单位单价
    linked_product_id: varchar("linked_product_id", { length: 36 }), // 关联的产品ID（内部生产原料）
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ingredients_category_idx").on(table.category),
    index("ingredients_name_idx").on(table.name),
    index("ingredients_linked_product_idx").on(table.linked_product_id),
  ]
);

// 设置表（存储包装规格、售卖品牌、分类、制作方法、全局密码等）
export const settings = pgTable(
  "settings",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    key: varchar("key", { length: 64 }).notNull().unique(),
    value: jsonb("value").notNull(), // JSON对象，根据key存储不同类型的配置
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("settings_key_idx").on(table.key),
  ]
);

// 库存表（每种产品每种包装的瓶数）
export const inventory = pgTable(
  "inventory",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    product_id: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
    spec_ml: integer("spec_ml").notNull(), // 包装规格
    quantity: integer("quantity").default(0).notNull(), // 装瓶数量
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("inventory_product_idx").on(table.product_id),
    index("inventory_spec_idx").on(table.spec_ml),
  ]
);

// 类型导出
export type ProductRecord = typeof products.$inferSelect;
export type IngredientRecord = typeof ingredients.$inferSelect;
export type SettingsRecord = typeof settings.$inferSelect;
export type InventoryRecord = typeof inventory.$inferSelect;