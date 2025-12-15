import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并CSS类名的工具函数
 * 结合clsx和tailwind-merge的功能，处理条件类名和Tailwind CSS冲突
 * @param inputs CSS类名数组，支持字符串、对象等形式
 * @returns 合并后的CSS类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
