import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 一个工具函数，用于合并 CSS 类名。
 * 它结合了 `clsx`（用于条件性地组合类名）和 `tailwind-merge`（用于解决 Tailwind CSS 类名冲突）。
 * @param inputs
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
