import { createClient } from '@supabase/supabase-js';

// 前端 Supabase 客户端（用于直传文件到 Storage）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cpiqsancvuyziaaogzwt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaXFzYW5jdnV5emlhYW9nend0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MDU4NzgsImV4cCI6MjA1NzA4MTg3OH0.MKx0zLFBv0t3N-_LxJPvXhOBvNsGJLpFqmHqL5tFJKk';

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
