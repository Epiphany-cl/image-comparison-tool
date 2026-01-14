/**
 * 国际化（i18n）配置
 *
 * 提供应用的多语言支持，功能包括：
 * 1. 定义支持的语言类型
 * 2. 提供翻译文本对象
 * 3. 创建 React Context 用于状态管理
 * 4. 提供初始语言检测函数
 * 5. 提供自定义 Hook 用于访问翻译
 */

'use client';

import { createContext, useContext } from 'react';
import { zh, en, type Translations } from '@/lib/locales';

/**
 * 支持的语言类型
 */
export type Locale = 'zh' | 'en';

/**
 * 翻译文本对象
 * 包含所有支持语言的翻译文本
 */
export const translations: Record<Locale, Translations> = { zh, en };

/**
 * 国际化 Context 类型定义
 */
interface I18nContextType {
    locale: Locale;                              // 当前语言
    t: Translations;                             // 当前语言的翻译文本
    setLocale: (locale: Locale) => void;         // 切换语言的函数
}

/**
 * 国际化 Context
 * 用于在组件树中传递语言状态和翻译文本
 */
export const I18nContext = createContext<I18nContextType | null>(null);

/**
 * 获取初始语言
 *
 * 优先级：
 * 1. localStorage 中保存的语言设置
 * 2. 浏览器语言（如果以 'zh' 开头则使用中文）
 * 3. 默认使用英文
 *
 * @returns 初始语言
 */
export function getInitialLocale(): Locale {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
        // 优先从 localStorage 读取用户保存的语言设置
        const saved = localStorage.getItem('locale');
        if (saved === 'zh' || saved === 'en') {
            return saved;
        }

        // 其次使用浏览器语言
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('zh')) {
            return 'zh';
        }
    }

    // 默认返回英文
    return 'en';
}

/**
 * 国际化 Hook
 *
 * 用于在组件中访问当前语言和翻译文本
 *
 * @throws {Error} 如果在 I18nProvider 外部使用则抛出错误
 * @returns 国际化上下文对象
 */
export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
