import { Editor } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

const lowlight = createLowlight(common);
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { CustomImage } from './custom-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { Markdown } from 'tiptap-markdown';
import { loadGoogleFonts } from './font-loader';
import { icons } from './icons';
import './style.css';

import { ImageModal } from './image-modal';

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

export class WritersPad {
    private editor: Editor;
    private toolbar: HTMLElement;
    private bubbleMenu: HTMLElement;
    private wrapper: HTMLElement;
    private options: WritersPadOptions;

    constructor(options: WritersPadOptions) {
        this.options = options;
        console.log('WritersPad Initializing with options:', options);
        if (!options.element) {
            throw new Error('WritersPad: element is required');
        }

        if (options.fonts) {
            loadGoogleFonts(options.fonts);
        }

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'writers-pad-wrapper';

        this.toolbar = document.createElement('div');
        this.toolbar.className = 'wp-toolbar';
        this.wrapper.appendChild(this.toolbar);

        this.bubbleMenu = document.createElement('div');
        this.bubbleMenu.className = 'wp-bubble-menu';
        this.wrapper.appendChild(this.bubbleMenu);

        const editorContent = document.createElement('div');
        this.wrapper.appendChild(editorContent);
        options.element.appendChild(this.wrapper);

        this.editor = new Editor({
            element: editorContent,
            extensions: [
                StarterKit.configure({
                    codeBlock: false,
                }),
                CodeBlockLowlight.configure({
                    lowlight,
                }),
                BubbleMenu.configure({
                    element: this.bubbleMenu,
                }),
                Typography,
                Underline,
                Subscript,
                Superscript,
                TextStyle,
                FontFamily,
                Color,
                Highlight.configure({ multicolor: true }),
                TaskList,
                TaskItem.configure({ nested: true }),
                CharacterCount,
                CustomImage.configure({
                    allowBase64: true,
                }),
                Link.configure({ openOnClick: false }),
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Placeholder.configure({
                    placeholder: options.placeholder || 'Start writing...',
                }),
                Markdown.configure({
                    html: true, // Required for textStyle (color, font) support
                    tightLists: true,
                }),
            ],
            content: options.content || '',
            onUpdate: ({ editor }) => {
                if (options.onUpdate) {
                    options.onUpdate(editor.getHTML());
                }

                if (options.onStatsUpdate) {
                    const words = editor.storage.characterCount.words();
                    const characters = editor.storage.characterCount.characters();
                    const stats: WritersPadStats = {
                        words,
                        characters,
                        readingTimeMinutes: Math.ceil(words / 225) || 1
                    };
                    options.onStatsUpdate(stats);
                }

                this.updateToolbar();
            },
            onSelectionUpdate: () => {
                this.updateToolbar();
            },
            editorProps: {
                attributes: {
                    class: 'writers-pad-container',
                },
            },
        });

        this.renderToolbar();
        this.renderBubbleMenu();
        if (options.defaultTheme) {
            this.setTheme(options.defaultTheme);
        }

        if (options.stickyToolbar !== false) {
            this.toolbar.classList.add('wp-sticky');
        }

        // Initialize color inputs
        this.initColorPickers();
    }

    private initColorPickers() {
        const textColorInput = document.createElement('input');
        textColorInput.type = 'color';
        textColorInput.id = 'wp-text-color';
        textColorInput.style.display = 'none'; // Hidden but clickable via JS
        textColorInput.addEventListener('input', (e) => {
            this.editor.chain().focus().setColor((e.target as HTMLInputElement).value).run();
        });
        this.toolbar.appendChild(textColorInput);

        const highlightColorInput = document.createElement('input');
        highlightColorInput.type = 'color';
        highlightColorInput.id = 'wp-highlight-color';
        highlightColorInput.style.display = 'none';
        highlightColorInput.addEventListener('input', (e) => {
            this.editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run();
        });
        this.toolbar.appendChild(highlightColorInput);
    }

    public setTheme(theme: 'light' | 'dark') {
        const btn = this.toolbar.querySelector('[data-command="theme-toggle"]');

        if (theme === 'dark') {
            this.wrapper.classList.add('dark-mode');
            if (btn) btn.innerHTML = icons.sun;
        } else {
            this.wrapper.classList.remove('dark-mode');
            if (btn) btn.innerHTML = icons.moon;
        }
    }

    private toggleTheme() {
        const isDark = this.wrapper.classList.contains('dark-mode');
        this.setTheme(isDark ? 'light' : 'dark');
    }

    private renderToolbar() {
        this.toolbar.innerHTML = `
      <!-- Typography Group -->
      <div class="wp-toolbar-group">
        <select class="wp-select" id="wp-font-family" title="Font Family">
          <option value="" selected>Default</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Arial">Arial</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Lucida Console">Lucida Console</option>
          <option value="Impact">Impact</option>
          <option value="Palatino Linotype">Palatino Linotype</option>
        </select>
        <select class="wp-select" id="wp-heading" title="Heading Level">
          <option value="p">Normal</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
      </div>

      <!-- Formatting Group -->
      <div class="wp-toolbar-group">
        <button class="wp-btn" data-command="bold" title="Bold">${icons.bold}</button>
        <button class="wp-btn" data-command="italic" title="Italic">${icons.italic}</button>
        <button class="wp-btn" data-command="underline" title="Underline">${icons.underline}</button>
        <button class="wp-btn" data-command="strike" title="Strikethrough">${icons.strike}</button>
        <button class="wp-btn" data-command="subscript" title="Subscript">${icons.subscript}</button>
        <button class="wp-btn" data-command="superscript" title="Superscript">${icons.superscript}</button>
        <button class="wp-btn" data-command="color" title="Text Color">${icons.colorText}</button>
        <button class="wp-btn" data-command="highlight" title="Highlight Color">${icons.highlight}</button>
        <button class="wp-btn" data-command="unsetAll" title="Clear Formatting">${icons.clearFormat}</button>
      </div>

      <!-- Alignment Group -->
      <div class="wp-toolbar-group">
        <button class="wp-btn" data-command="align-left" title="Align Left">${icons.alignLeft}</button>
        <button class="wp-btn" data-command="align-center" title="Align Center">${icons.alignCenter}</button>
        <button class="wp-btn" data-command="align-right" title="Align Right">${icons.alignRight}</button>
      </div>

      <!-- Lists Group -->
      <div class="wp-toolbar-group">
        <button class="wp-btn" data-command="bulletList" title="Bullet List">${icons.bulletList}</button>
        <button class="wp-btn" data-command="orderedList" title="Ordered List">${icons.orderedList}</button>
        <button class="wp-btn" data-command="taskList" title="Task List">${icons.taskList}</button>
        <button class="wp-btn" data-command="indent" title="Indent">${icons.indent}</button>
        <button class="wp-btn" data-command="outdent" title="Outdent">${icons.outdent}</button>
      </div>

      <!-- Insert Group -->
      <div class="wp-toolbar-group">
        <button class="wp-btn" data-command="image" title="Insert Image">${icons.image}</button>
        <button class="wp-btn" data-command="link" title="Insert Link">${icons.link}</button>
        <button class="wp-btn" data-command="codeBlock" title="Code Block">${icons.code}</button>
        <button class="wp-btn" data-command="horizontalRule" title="Horizontal Rule">${icons.horizontalRule}</button>
        <button class="wp-btn" data-command="blockquote" title="Blockquote">${icons.blockquote}</button>
      </div>

      <!-- History Group -->
      <div class="wp-toolbar-group">
        <button class="wp-btn" data-command="undo" title="Undo">${icons.undo}</button>
        <button class="wp-btn" data-command="redo" title="Redo">${icons.redo}</button>
      </div>

       <div class="wp-toolbar-group" style="margin-left: auto;">
         <button class="wp-btn" data-command="theme-toggle" title="Toggle Dark/Light Mode">${icons.moon}</button>
       </div>
    `;

        // Bind events
        this.toolbar.querySelectorAll('.wp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = (e.target as HTMLElement).closest('button');
                if (!target) return;
                const command = target.dataset.command;
                if (command) this.execCommand(command);
            });
        });

        this.toolbar.querySelector('#wp-font-family')?.addEventListener('change', (e) => {
            const font = (e.target as HTMLSelectElement).value;
            if (font) {
                this.editor.chain().focus().setFontFamily(font).run();
            } else {
                this.editor.chain().focus().unsetFontFamily().run();
            }
        });

        this.toolbar.querySelector('#wp-heading')?.addEventListener('change', (e) => {
            const val = (e.target as HTMLSelectElement).value;
            if (val === 'p') {
                this.editor.chain().focus().setParagraph().run();
            } else {
                // @ts-ignore
                this.editor.chain().focus().toggleHeading({ level: parseInt(val.replace('h', '')) }).run();
            }
        });
    }

    private renderBubbleMenu() {
        this.bubbleMenu.innerHTML = `
      <button class="wp-btn" data-command="bold" title="Bold">${icons.bold}</button>
      <button class="wp-btn" data-command="italic" title="Italic">${icons.italic}</button>
      <button class="wp-btn" data-command="link" title="Link">${icons.link}</button>
      <button class="wp-btn" data-command="unlink" title="Unlink">${icons.unlink}</button>
    `;

        this.bubbleMenu.querySelectorAll('.wp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = (e.currentTarget as HTMLElement).dataset.command;
                this.execCommand(command);
            });
        });
    }

    private execCommand(command?: string) {
        if (!command) return;

        switch (command) {
            case 'bold': this.editor.chain().focus().toggleBold().run(); break;
            case 'italic': this.editor.chain().focus().toggleItalic().run(); break;
            case 'underline': this.editor.chain().focus().toggleUnderline().run(); break;
            case 'strike': this.editor.chain().focus().toggleStrike().run(); break;
            case 'subscript': this.editor.chain().focus().toggleSubscript().run(); break;
            case 'superscript': this.editor.chain().focus().toggleSuperscript().run(); break;
            case 'unsetAll': this.editor.chain().focus().unsetAllMarks().clearNodes().run(); break;

            case 'color':
                (this.toolbar.querySelector('#wp-text-color') as HTMLInputElement).click();
                break;
            case 'highlight':
                (this.toolbar.querySelector('#wp-highlight-color') as HTMLInputElement).click();
                break;

            case 'align-left': this.editor.chain().focus().setTextAlign('left').run(); break;
            case 'align-center': this.editor.chain().focus().setTextAlign('center').run(); break;
            case 'align-right': this.editor.chain().focus().setTextAlign('right').run(); break;

            case 'bulletList': this.editor.chain().focus().toggleBulletList().run(); break;
            case 'orderedList': this.editor.chain().focus().toggleOrderedList().run(); break;
            case 'taskList': this.editor.chain().focus().toggleTaskList().run(); break;

            case 'indent':
                if (this.editor.can().sinkListItem('listItem')) {
                    this.editor.chain().focus().sinkListItem('listItem').run();
                } else if (this.editor.can().sinkListItem('taskItem')) {
                    this.editor.chain().focus().sinkListItem('taskItem').run();
                }
                break;
            case 'outdent':
                if (this.editor.can().liftListItem('listItem')) {
                    this.editor.chain().focus().liftListItem('listItem').run();
                } else if (this.editor.can().liftListItem('taskItem')) {
                    this.editor.chain().focus().liftListItem('taskItem').run();
                }
                break;

            case 'codeBlock': this.editor.chain().focus().toggleCodeBlock().run(); break;

            case 'image':
                this.showImageModal();
                break;
            case 'link':
                const previousUrl = this.editor.getAttributes('link').href;
                const linkUrl = window.prompt('URL', previousUrl || '');
                if (linkUrl === null) return;
                if (linkUrl === '') {
                    this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    return;
                }
                this.editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                break;
            case 'unlink':
                this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
                break;
            case 'horizontalRule':
                this.editor.chain().focus().setHorizontalRule().run();
                break;
            case 'blockquote': this.editor.chain().focus().toggleBlockquote().run(); break;

            case 'undo': this.editor.chain().focus().undo().run(); break;
            case 'redo': this.editor.chain().focus().redo().run(); break;
            case 'theme-toggle': this.toggleTheme(); break;
        }
    }

    private updateToolbar() {
        this.toolbar.querySelectorAll('.wp-btn').forEach(btn => {
            const cmd = (btn as HTMLElement).dataset.command;
            let isActive = false;

            if (cmd === 'align-left') isActive = this.editor.isActive({ textAlign: 'left' });
            else if (cmd === 'align-center') isActive = this.editor.isActive({ textAlign: 'center' });
            else if (cmd === 'align-right') isActive = this.editor.isActive({ textAlign: 'right' });
            else if (cmd === 'bulletList') isActive = this.editor.isActive('bulletList');
            else if (cmd === 'orderedList') isActive = this.editor.isActive('orderedList');
            else if (cmd === 'taskList') isActive = this.editor.isActive('taskList');
            else if (cmd === 'blockquote') isActive = this.editor.isActive('blockquote');
            else if (cmd === 'link') isActive = this.editor.isActive('link');
            else if (cmd && ['bold', 'italic', 'underline', 'strike'].includes(cmd)) {
                isActive = this.editor.isActive(cmd);
            }

            if (isActive) btn.classList.add('is-active');
            else btn.classList.remove('is-active');
        });

        // Update heading Select
        const headingSelect = this.toolbar.querySelector('#wp-heading') as HTMLSelectElement;
        if (headingSelect) {
            if (this.editor.isActive('heading', { level: 1 })) headingSelect.value = 'h1';
            else if (this.editor.isActive('heading', { level: 2 })) headingSelect.value = 'h2';
            else if (this.editor.isActive('heading', { level: 3 })) headingSelect.value = 'h3';
            else headingSelect.value = 'p';
        }
    }

    public getHTML(): string {
        return this.editor.getHTML();
    }

    public getMarkdown(): string {
        // @ts-ignore
        const md = this.editor.storage.markdown.getMarkdown();
        // Strip spans ensuring font tags are removed for cleaner Markdown
        return md ? md.replace(/<\/?span[^>]*>/g, '') : '';
    }

    public getJSON(): object {
        return this.editor.getJSON();
    }

    private showImageModal() {
        const isDark = this.wrapper.classList.contains('dark-mode');
        new ImageModal({
            theme: isDark ? 'dark' : 'light',
            onImageUpload: this.options.onImageUpload,
            onImageSelect: this.options.onImageSelect,
            onInsert: (url) => {
                this.editor.chain().focus().setImage({ src: url }).run();
            },
            onClose: () => {
                this.editor.commands.focus();
            }
        });
    }

    public destroy() {
        this.editor.destroy();
    }
}
