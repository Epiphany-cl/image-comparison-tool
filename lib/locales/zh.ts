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
    // 使用说明相关
    help: string;
    helpTitle: string;
    helpDescription: string;
    gettingStarted: string;
    uploadImages: string;
    uploadImagesDesc: string;
    compareImages: string;
    compareImagesDesc: string;
    gestures: string;
    dragToPan: string;
    dragToPanDesc: string;
    pinchToZoom: string;
    pinchToZoomDesc: string;
    scrollToZoom: string;
    scrollToZoomDesc: string;
    trackpadPan: string;
    trackpadPanDesc: string;
    faq: string;
    faq1Question: string;
    faq1Answer: string;
    faq2Question: string;
    faq2Answer: string;
    faq3Question: string;
    faq3Answer: string;
    faq4Question: string;
    faq4Answer: string;
    dontShowAgain: string;
    close: string;
    gotIt: string;
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
    pasteErrorNoImage: '剪贴板中未检测到图片',

    // 使用说明相关
    help: '使用说明',
    helpTitle: '图片对比工具使用指南',
    helpDescription: '快速了解如何使用此工具进行图片对比',
    gettingStarted: '开始使用',
    uploadImages: '1. 上传图片',
    uploadImagesDesc: '拖放图片到左右两侧的区域，或点击选择文件',
    compareImages: '2. 对比图片',
    compareImagesDesc: '自动同步缩放和平移，同时查看两张图片的相同位置',
    gestures: '交互手势',
    dragToPan: '拖拽平移',
    dragToPanDesc: '在图片上按住鼠标左键拖动，可平移查看不同区域',
    pinchToZoom: '双指缩放',
    pinchToZoomDesc: '使用触控板或触摸屏进行双指捏合来缩放图片',
    scrollToZoom: '鼠标滚轮缩放',
    scrollToZoomDesc: '滚动鼠标滚轮可缩放图片，以光标为中心点',
    trackpadPan: '触控板平移',
    trackpadPanDesc: '使用触控板双指滑动可平移图片',
    faq: '常见问题',
    faq1Question: '如何上传图片？',
    faq1Answer: '您可以直接拖放图片到左右两侧的虚线区域，或点击区域选择文件。还支持 Ctrl+V 粘贴已复制的图片。',
    faq2Question: '缩放范围是多少？',
    faq2Answer: '支持 0.1x 到 10x 的缩放范围。您可以通过顶部控制栏的 +/− 按钮，鼠标滚轮，或双指捏合来调整。',
    faq3Question: '为什么两张图片会同步移动？',
    faq3Answer: '这是设计特性。无论您如何操作一侧图片，另一侧都会同步变化，方便精确对比两个图像的相同位置。',
    faq4Question: '图片数据如何处理？',
    faq4Answer: '所有图片都只在浏览器本地处理，不会上传到服务器。关闭浏览器后数据会自动清理，保障您的隐私安全。',
    dontShowAgain: '不再显示',
    close: '关闭',
    gotIt: '明白了'
};
