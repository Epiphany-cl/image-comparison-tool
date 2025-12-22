// 翻译接口
export interface Translations {
    imageCompare: string;
    clear: string;
    processing: string;
    dropOrClick: string;
    loadError: string;
    mobileNotSupported: {
        title: string;
        description: string;
    };
    language: string;
    switchTo: string;
    pasteSuccess: string;
    pasteError: string;
    pasteErrorNoImage: string;
}

// 中文翻译
export const zh: Translations = {
    // 控制栏
    imageCompare: '图片对比',
    clear: '清空',

    // 图片面板
    processing: '正在处理图片...',
    dropOrClick: '拖放或点击上传',
    loadError: '图片加载失败，请检查文件格式',

    // 移动端提示
    mobileNotSupported: {
        title: '暂不支持移动设备',
        description: '图片对比工具需要更大的屏幕空间来提供最佳体验，请使用电脑设备访问。'
    },

    // 语言切换
    language: '中文',
    switchTo: 'EN',

    // 粘贴功能
    pasteSuccess: '图片已粘贴到 {side}',
    pasteError: '粘贴失败，请确保已复制图片',
    pasteErrorNoImage: '剪贴板中未检测到图片'
};
