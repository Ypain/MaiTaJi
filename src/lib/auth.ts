import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  avatar?: string | null;
  role?: string;
}

export function hashPassword(password: string): string {
  // 使用 Node.js crypto 模块进行密码哈希
  return createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

export async function createUser(username: string, password: string): Promise<AuthUser | null> {
  const client = getSupabaseClient();
  const passwordHash = hashPassword(password);
  
  const { data, error } = await client
    .from('users')
    .insert({
      email: username, // 使用 email 字段存储账号名
      name: username, // 默认用户名与账号相同
      password_hash: passwordHash,
    })
    .select('id, email, name, avatar')
    .single();
  
  if (error || !data) {
    console.error('创建用户失败:', error);
    return null;
  }
  
  return {
    id: data.id,
    username: data.email, // 从 email 字段读取账号名
    name: data.name,
    avatar: data.avatar,
    role: 'user',
  };
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  const client = getSupabaseClient();
  
  const { data: user, error } = await client
    .from('users')
    .select('id, email, name, avatar, password_hash')
    .eq('email', username)
    .single();
  
  if (error || !user) {
    return null;
  }
  
  if (!user.password_hash) {
    return null;
  }
  
  const isValid = verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  // 检查是否是管理员账号
  const isAdmin = user.email === '18700889961';
  
  return {
    id: user.id,
    username: user.email,
    name: user.name,
    avatar: user.avatar,
    role: isAdmin ? 'admin' : 'user',
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  
  if (!userId) {
    return null;
  }
  
  const client = getSupabaseClient();
  const { data: user, error } = await client
    .from('users')
    .select('id, email, name, avatar')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    return null;
  }
  
  // 检查是否是管理员账号
  const isAdmin = user.email === '18700889961';
  
  return {
    id: user.id,
    username: user.email, // 从 email 字段读取账号名
    name: user.name,
    avatar: user.avatar,
    role: isAdmin ? 'admin' : 'user',
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}
