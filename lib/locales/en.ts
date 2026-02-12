/**
 * 英文翻译文件
 *
 * 包含应用所有界面的英文翻译文本
 * 与中文翻译文件保持相同的键名结构，以便于切换语言
 */

import type { Translations } from './zh';

/**
 * 英文翻译对象
 *
 * 包含以下分类的翻译：
 * - 通用 UI 文本（按钮、标签等）
 * - 状态消息（加载、错误、成功等）
 * - 帮助文档（开始使用、手势、FAQ）
 */
export const en: Translations = {
    // 通用 UI 文本
    imageCompare: 'Media Compare',
    clear: 'Clear',
    lockView: 'Lock View (Sync Move)',
    unlockView: 'Unlock View (Allow Independent Move)',

    // 状态消息
    processing: 'Processing...',
    dropOrClick: 'Drop or click to upload images/videos',
    loadError: 'Failed to load, please check the file format',

    // 移动端不支持提示
    mobileNotSupported: {
        title: 'Mobile Not Supported',
        description: 'Comparison tool requires a larger screen for the best experience. Please use a desktop device.'
    },

    // 语言切换
    language: 'English',
    switchTo: '中',

    // 粘贴功能
    pasteSuccess: 'Content pasted to {side}',
    pasteError: 'Paste failed, please ensure you have copied an image or video',
    pasteErrorNoImage: 'No usable media detected in clipboard',

    // 帮助系统
    help: 'Help',
    helpTitle: 'Media Comparison Tool Guide',
    helpDescription: 'Quick guide to get started with image and video comparison',

    // 帮助 - 开始使用
    gettingStarted: 'Getting Started',
    uploadImages: '1. Upload Files',
    uploadImagesDesc: 'Drag and drop images or videos to the left/right areas, or click to select files',
    compareImages: '2. Compare Media',
    compareImagesDesc: 'Automatic synchronized zoom and pan to view the same position; videos will play in sync',

    // 帮助 - 交互手势
    gestures: 'Gestures',
    dragToPan: 'Drag to Pan',
    dragToPanDesc: 'Hold and drag on content to move around',
    pinchToZoom: 'Pinch to Zoom',
    pinchToZoomDesc: 'Use trackpad or touch screen to zoom with pinch gesture',
    scrollToZoom: 'Scroll to Zoom',
    scrollToZoomDesc: 'Use mouse wheel to zoom, centered on cursor position',
    trackpadPan: 'Trackpad Pan',
    trackpadPanDesc: 'Use trackpad two-finger swipe to pan the content',
    alignImagesDesc: 'Click the unlock button in the top bar to move each side independently for alignment',

    // 帮助 - 常见问题
    faq: 'FAQ',
    faq1Question: 'How to upload files?',
    faq1Answer: 'You can drag and drop images or videos to the dashed areas, or click to select files. Also supports Ctrl+V to paste copied content.',
    faq2Question: 'What is the zoom range?',
    faq2Answer: 'Supports zoom from 0.1x to 10x. You can adjust using +/- buttons, mouse wheel, or pinch gestures.',
    faq3Question: 'Does it support video comparison?',
    faq3Answer: 'Yes, you can upload two videos for comparison. Their playback progress, play/pause state will be synchronized automatically.',
    faq4Question: 'How is my data handled?',
    faq4Answer: 'All files are processed locally in your browser and never uploaded to any server. Data is automatically cleared when you close the browser.',

    // 对话框按钮
    dontShowAgain: 'Don\'t show again',
    close: 'Close',
    gotIt: 'Got it'
};
