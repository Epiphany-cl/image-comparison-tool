// English translations
import type { Translations } from './zh';

export const en: Translations = {
    // Control bar
    imageCompare: 'Image Compare',
    clear: 'Clear',

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
    pasteErrorNoImage: 'No image detected in clipboard'
};
