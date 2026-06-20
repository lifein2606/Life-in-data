/**
 * Supabase 客户端初始化
 * 直接使用硬编码的 URL 和 Key，不依赖环境变量
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置（硬编码）
const SUPABASE_URL = 'https://br-tidy-hare-2c5e43d3.supabase2.aidap-global.cn-beijing.volces.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNjI0NjI2ODMsInJvbGUiOiJhbm9uIn0.Ia-EdaOfcZmLg0WYjck71f1oHNJ_Amjq9TeElbWCzXU';

// 创建 Supabase 客户端
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 获取 Supabase 客户端实例
 */
export function getSupabaseClient() {
  return supabaseClient;
}

/**
 * 检查是否在客户端环境
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}