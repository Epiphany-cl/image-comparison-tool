import * as React from 'react';
// Radix UI Slot component for merging props and functionality into a child element.
import { Slot } from '@radix-ui/react-slot';
// class-variance-authority is a library for creating variants of a component.
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// 使用 cva (class-variance-authority) 定义按钮的样式变体
// 第一个参数是所有变体共享的基础样式
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    // 定义不同的样式变体
    variants: {
      // 'variant' 定义了按钮的视觉风格
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
      // 'size' 定义了按钮的尺寸
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10'
      }
    },
    // 默认的变体配置
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// 按钮组件
function Button({
  className,
  variant,
  size,
  asChild = false, // 'asChild' prop 允许将按钮的样式和行为应用到其子组件上
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  // 如果 asChild 为 true，则使用 Radix UI 的 Slot 组件作为根元素，
  // 否则使用标准的 <button> 元素。
  // Slot 会将传递给它的 props (如 className, onClick 等) 合并到它的直接子元素上。
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))} // 使用 cn 工具函数合并基础样式、变体样式和传入的 className
      {...props}
    />
  );
}

export { Button, buttonVariants };
