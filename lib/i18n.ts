'use client';

import { createContext, useContext } from 'react';
import { zh, en, type Translations } from '@/lib/locales';

// 支持的语言
export type Locale = 'zh' | 'en';

// 翻译映射
export const translations: Record<Locale, Translations> = { zh, en };

// 语言Context类型
interface I18nContextType {
    locale: Locale;
    t: Translations;
    setLocale: (locale: Locale) => void;
}

// 创建Context
export const I18nContext = createContext<I18nContextType | null>(null);

// 获取初始语言
export function getInitialLocale(): Locale {
    // 优先使用localStorage中保存的偏好
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('locale');
        if (saved === 'zh' || saved === 'en') {
            return saved;
        }

        // 基于浏览器语言检测
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('zh')) {
            return 'zh';
        }
    }

    // 默认英文
    return 'en';
}

// Hook: 使用i18n
export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
