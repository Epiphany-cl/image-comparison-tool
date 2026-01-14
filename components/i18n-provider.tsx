/**
 * 国际化提供者组件
 *
 * 为整个应用提供国际化支持，功能包括：
 * 1. 检测并初始化用户语言偏好（从 localStorage 或浏览器语言）
 * 2. 提供语言切换功能
 * 3. 防止语言切换时的内容闪烁
 * 4. 同步更新 HTML lang 属性
 */

'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { I18nContext, type Locale, translations, getInitialLocale } from '@/lib/i18n';

/**
 * 国际化提供者属性接口
 */
interface I18nProviderProps {
    children: React.ReactNode;  // 子组件
}

/**
 * 国际化提供者组件
 *
 * 使用 React Context API 为整个应用提供翻译文本和语言切换功能
 */
export function I18nProvider({ children }: I18nProviderProps) {
    // 当前语言状态，默认为中文
    const [locale, setLocaleState] = useState<Locale>('zh');
    // 组件是否已挂载，用于防止服务端渲染和客户端渲染不一致
    const [mounted, setMounted] = useState(false);

    // 组件挂载时初始化语言设置
    useEffect(() => {
        // 获取初始语言（从 localStorage 或浏览器语言）
        const initialLocale = getInitialLocale();
        setLocaleState(initialLocale);
        setMounted(true);

        // 移除准备类名，允许显示翻译后的内容
        document.documentElement.classList.remove('i18n-preparing');
    }, []);

    /**
     * 切换语言函数
     *
     * 功能：
     * - 更新组件状态
     * - 保存到 localStorage
     * - 更新 HTML lang 属性
     */
    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en';
    }, []);

    // 监听语言变化，同步更新 HTML lang 属性
    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
        }
    }, [locale, mounted]);

    return (
        // 提供国际化上下文，包含当前语言、翻译文本和语言切换函数
        <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}
