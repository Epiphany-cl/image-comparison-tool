/**
 * 工具函数库
 *
 * 提供通用的工具函数，用于简化常见操作
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名的工具函数
 *
 * 功能：
 * - 使用 clsx 合并多个类名，支持条件类名
 * - 使用 tailwind-merge 解决 Tailwind CSS 类名冲突
 * - 确保后传入的类名优先于前面的类名
 *
 * 使用场景：
 * - 合并组件的默认类名和自定义类名
 * - 根据条件动态添加类名
 * - 避免类名冲突导致的样式问题
 *
 * @param inputs - 类名输入，可以是字符串、对象、数组等
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * // 基本用法
 * cn('px-4', 'py-2') // 'px-4 py-2'
 *
 * // 条件类名
 * cn('px-4', isActive && 'bg-blue-500') // 'px-4 bg-blue-500'
 *
 * // 解决冲突（后面的类名优先）
 * cn('px-4', 'px-6') // 'px-6'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
