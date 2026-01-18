
export interface WritersPadStats {
    words: number;
    characters: number;
    readingTimeMinutes: number;
}
export interface WritersPadOptions {
    element: HTMLElement;
    content?: string;
    defaultTheme?: 'light' | 'dark';
    stickyToolbar?: boolean;
    placeholder?: string;
    fonts?: string[];
    onUpdate?: (html: string) => void;
    onStatsUpdate?: (stats: WritersPadStats) => void;
    onImageUpload?: (file: File) => Promise<string>;
    onImageSelect?: () => Promise<string>;
}
export declare class WritersPad {
    private editor;
    private toolbar;
    private bubbleMenu;
    private wrapper;
    private options;
    constructor(options: WritersPadOptions);
    private initColorPickers;
    setTheme(theme: 'light' | 'dark'): void;
    private toggleTheme;
    private renderToolbar;
    private renderBubbleMenu;
    private execCommand;
    private updateToolbar;
    getHTML(): string;
    getMarkdown(): string;
    getJSON(): object;
    private showImageModal;
    destroy(): void;
}
