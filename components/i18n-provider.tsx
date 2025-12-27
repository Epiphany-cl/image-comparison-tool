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
    // 初始状态仍设为 'zh' 以配合静态 HTML，但在 useEffect 中根据实际情况切换
    const [locale, setLocaleState] = useState<Locale>('zh');
    const [mounted, setMounted] = useState(false);

    // 客户端挂载后，检测实际语言并清理准备状态
    useEffect(() => {
        const initialLocale = getInitialLocale();
        setLocaleState(initialLocale);
        setMounted(true);

        // 移除防闪烁类名，使页面可见
        document.documentElement.classList.remove('i18n-preparing');
    }, []);

    // 更新语言并持久化
    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        // 更新html lang属性
        document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en';
    }, []);

    // 后续语言切换时更新 html lang
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
