// English translations
import type { Translations } from './zh';

export const en: Translations = {
    // Control bar
    imageCompare: 'Image Compare',
    clear: 'Clear',
    lockView: 'Lock View (Sync Move)',
    unlockView: 'Unlock View (Allow Independent Move)',

    // Image panel
    processing: 'Processing image...',
    dropOrClick: 'Drop or click to upload',
    loadError: 'Failed to load image, please check the file format',

    // Mobile notice
    mobileNotSupported: {
        title: 'Mobile Not Supported',
        description: 'Image comparison tool requires a larger screen for the best experience. Please use a desktop device.'
    },

    // Language switch
    language: 'English',
    switchTo: '中',

    // Paste functionality
    pasteSuccess: 'Image pasted to {side}',
    pasteError: 'Paste failed, please ensure you have copied an image',
    pasteErrorNoImage: 'No image detected in clipboard',

    // Help system
    help: 'Help',
    helpTitle: 'Image Comparison Tool Guide',
    helpDescription: 'Quick guide to get started with image comparison',
    gettingStarted: 'Getting Started',
    uploadImages: '1. Upload Images',
    uploadImagesDesc: 'Drag and drop images to the left/right areas, or click to select files',
    compareImages: '2. Compare Images',
    compareImagesDesc: 'Automatic synchronized zoom and pan to view the same position',
    gestures: 'Gestures',
    dragToPan: 'Drag to Pan',
    dragToPanDesc: 'Hold and drag on image to move around',
    pinchToZoom: 'Pinch to Zoom',
    pinchToZoomDesc: 'Use trackpad or touch screen to zoom with pinch gesture',
    scrollToZoom: 'Scroll to Zoom',
    scrollToZoomDesc: 'Use mouse wheel to zoom, centered on cursor position',
    trackpadPan: 'Trackpad Pan',
    trackpadPanDesc: 'Use trackpad two-finger swipe to pan the image',
    alignImagesDesc: 'Click the unlock button in the top bar to move each image independently for alignment',
    faq: 'FAQ',
    faq1Question: 'How to upload images?',
    faq1Answer: 'You can drag and drop images to the dashed areas, or click to select files. Also supports Ctrl+V to paste copied images.',
    faq2Question: 'What is the zoom range?',
    faq2Answer: 'Supports zoom from 0.1x to 10x. You can adjust using +/- buttons, mouse wheel, or pinch gestures.',
    faq3Question: 'Why do images move together?',
    faq3Answer: 'By default, images move together. You can click the unlock icon in the top bar to move each image independently for alignment.',
    faq4Question: 'How is my data handled?',
    faq4Answer: 'All images are processed locally in your browser and never uploaded to any server. Data is automatically cleared when you close the browser.',
    dontShowAgain: 'Don\'t show again',
    close: 'Close',
    gotIt: 'Got it'
};
