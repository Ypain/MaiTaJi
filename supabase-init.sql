-- 在 Supabase SQL Editor 中执行此脚本创建表

-- 1. 创建商品表
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    image_url TEXT NOT NULL,
    price VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_subcategory_idx ON products(subcategory);

-- 2. 创建买家展示表
CREATE TABLE IF NOT EXISTS showcases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    password_hash TEXT,
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
