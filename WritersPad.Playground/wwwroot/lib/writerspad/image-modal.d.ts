export interface ImageModalOptions {
    onImageUpload?: (file: File) => Promise<string>;
    onImageSelect?: () => Promise<string>;
    onInsert: (url: string) => void;
    onClose: () => void;
    theme?: 'light' | 'dark';
}
export declare class ImageModal {
    private element;
    private options;
    constructor(options: ImageModalOptions);
    private render;
    private bindEvents;
    private handleUpload;
    private close;
}
