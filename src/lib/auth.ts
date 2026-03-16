import { getSupabaseClient } from '@/storage/database/supabase-client';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { User } from '@/storage/database/shared/schema';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export function hashPassword(password: string): string {
  // 使用 Node.js crypto 模块进行密码哈希
  return createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

export async function createUser(email: string, name: string, password: string): Promise<AuthUser | null> {
  const client = getSupabaseClient();
  const passwordHash = hashPassword(password);
  
  const { data, error } = await client
    .from('users')
    .insert({
      email,
      name,
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
    email: data.email,
    name: data.name,
    avatar: data.avatar,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const client = getSupabaseClient();
  
  const { data: user, error } = await client
    .from('users')
    .select('id, email, name, avatar, password_hash')
    .eq('email', email)
    .single();
  
  if (error || !user) {
    return null;
  }
  
  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
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
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
  };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}
