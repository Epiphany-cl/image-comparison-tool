/**
 * 中文翻译文件
 *
 * 定义翻译接口类型和中文翻译文本
 * 作为默认语言，其他语言文件（如英文）需要实现相同的接口
 */

/**
 * 翻译接口定义
 *
 * 定义应用中所有需要翻译的文本键名
 * 确保所有语言文件都实现相同的接口，保证类型安全
 */
export interface Translations {
    // 通用 UI 文本
    imageCompare: string;
    clear: string;
    lockView: string;
    unlockView: string;

    // 状态消息
    processing: string;
    dropOrClick: string;
    loadError: string;

    // 移动端不支持提示
    mobileNotSupported: {
        title: string;
        description: string;
    };

    // 语言切换
    language: string;
    switchTo: string;

    // 粘贴功能
    pasteSuccess: string;
    pasteError: string;
    pasteErrorNoImage: string;

    // 帮助系统
    help: string;
    helpTitle: string;
    helpDescription: string;

    // 帮助 - 开始使用
    gettingStarted: string;
    uploadImages: string;
    uploadImagesDesc: string;
    compareImages: string;
    compareImagesDesc: string;

    // 帮助 - 交互手势
    gestures: string;
    dragToPan: string;
    dragToPanDesc: string;
    pinchToZoom: string;
    pinchToZoomDesc: string;
    scrollToZoom: string;
    scrollToZoomDesc: string;
    trackpadPan: string;
    trackpadPanDesc: string;
    alignImagesDesc: string;

    // 帮助 - 常见问题
    faq: string;
    faq1Question: string;
    faq1Answer: string;
    faq2Question: string;
    faq2Answer: string;
    faq3Question: string;
    faq3Answer: string;
    faq4Question: string;
    faq4Answer: string;

    // 对话框按钮
    dontShowAgain: string;
    close: string;
    gotIt: string;
}

/**
 * 中文翻译对象
 *
 * 包含应用所有界面的中文翻译文本
 * 作为默认语言，其他语言文件需要实现相同的键名
 */
export const zh: Translations = {
    // 通用 UI 文本
    imageCompare: '多媒体对比',
    clear: '清空',
    lockView: '锁定视图（同步移动）',
    unlockView: '解锁视图（独立移动）',

    // 状态消息
    processing: '正在处理...',
    dropOrClick: '拖放或点击上传图片/视频',
    loadError: '加载失败，请检查文件格式',

    // 移动端不支持提示
    mobileNotSupported: {
        title: '暂不支持移动设备',
        description: '对比工具需要更大的屏幕空间来提供最佳体验，请使用电脑设备访问。'
    },

    // 语言切换
    language: '中文',
    switchTo: 'EN',

    // 粘贴功能
    pasteSuccess: '内容已粘贴到 {side}',
    pasteError: '粘贴失败，请确保已复制图片或视频',
    pasteErrorNoImage: '剪贴板中未检测到可用的多媒体内容',

    // 帮助系统
    help: '使用说明',
    helpTitle: '多媒体对比工具使用指南',
    helpDescription: '快速了解如何使用此工具进行图片和视频对比',

    // 帮助 - 开始使用
    gettingStarted: '开始使用',
    uploadImages: '1. 上传文件',
    uploadImagesDesc: '拖放图片或视频到左右两侧的区域，或点击选择文件',
    compareImages: '2. 对比内容',
    compareImagesDesc: '自动同步缩放和平移，同时查看两份内容的相同位置；视频将同步播放',

    // 帮助 - 交互手势
    gestures: '交互手势',
    dragToPan: '拖拽平移',
    dragToPanDesc: '在内容上按住鼠标左键拖动，可平移查看不同区域',
    pinchToZoom: '双指缩放',
    pinchToZoomDesc: '使用触控板或触摸屏进行双指捏合来缩放内容',
    scrollToZoom: '鼠标滚轮缩放',
    scrollToZoomDesc: '滚动鼠标滚轮可缩放内容，以光标为中心点',
    trackpadPan: '触控板平移',
    trackpadPanDesc: '使用触控板双指滑动可平移内容',
    alignImagesDesc: '点击顶部解锁按钮，可独立移动单侧内容进行位置对齐',

    // 帮助 - 常见问题
    faq: '常见问题',
    faq1Question: '如何上传文件？',
    faq1Answer: '您可以直接拖放图片或视频到左右两侧的虚线区域，或点击区域选择文件。还支持 Ctrl+V 粘贴已复制的内容。',
    faq2Question: '缩放范围是多少？',
    faq2Answer: '支持 0.1x 到 10x 的缩放范围。您可以通过顶部控制栏的 +/− 按钮，鼠标滚轮，或双指捏合来调整。',
    faq3Question: '支持视频对比吗？',
    faq3Answer: '是的，您可以同时上传两个视频进行对比，它们的播放进度、播放/暂停状态将自动同步。',
    faq4Question: '数据如何处理？',
    faq4Answer: '所有文件都只在浏览器本地处理，不会上传到服务器。关闭浏览器后数据会自动清理，保障您的隐私安全。',

    // 对话框按钮
    dontShowAgain: '不再显示',
    close: '关闭',
    gotIt: '明白了'
};
