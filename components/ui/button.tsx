/**
 * 按钮组件
 *
 * 基于 Radix UI Slot 和 class-variance-authority (CVA) 构建的可复用按钮组件
 *
 * 功能特性：
 * - 支持多种样式变体（default, destructive, outline, secondary, ghost, link）
 * - 支持多种尺寸（default, sm, lg, icon, icon-sm, icon-lg）
 * - 支持 asChild 属性，可渲染为子组件
 * - 完整的无障碍支持
 * - 深色模式支持
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * 按钮样式变体定义
 * 使用 CVA (class-variance-authority) 管理按钮的多种样式组合
 */
const buttonVariants = cva(
  // 基础样式：所有按钮共有的样式
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      // 样式变体：控制按钮的外观
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      // 尺寸变体：控制按钮的大小
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10'
      }
    },
    defaultVariants: {
      // 默认变体
      variant: 'default',
      size: 'default'
    }
  }
);

/**
 * 按钮组件属性接口
 * 继承自 React button 元素的属性，并添加自定义属性
 */
function Button({
  className,           // 自定义类名
  variant,             // 样式变体
  size,                // 尺寸变体
  asChild = false,     // 是否渲染为子组件
  ...props             // 其他属性
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean  // 是否使用 Radix UI Slot 渲染子组件
  }) {
  // 根据 asChild 属性决定渲染为 button 还是 Slot
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
