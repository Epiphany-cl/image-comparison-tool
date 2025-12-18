'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { I18nContext, type Locale, translations, getInitialLocale } from '@/lib/i18n';

interface I18nProviderProps {
    children: React.ReactNode;
}

/**
 * 国际化Provider组件
 * 管理语言状态并提供给所有子组件
 */
export function I18nProvider({ children }: I18nProviderProps) {
    // 使用中文作为初始值，避免hydration mismatch
    const [locale, setLocaleState] = useState<Locale>('zh');
    const [mounted, setMounted] = useState(false);

    // 客户端挂载后，检测实际语言
    useEffect(() => {
        setLocaleState(getInitialLocale());
        setMounted(true);
    }, []);

    // 更新语言并持久化
    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        // 更新html lang属性
        document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en';
    }, []);

    // 初始化html lang
    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
        }
    }, [locale, mounted]);

    return (
        <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}
