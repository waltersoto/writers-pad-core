# WritersPad

A premium, block-based rich text editor for the modern web. Built on top of Tiptap, WritersPad provides a distraction-free writing experience with powerful features out of the box.

![WritersPad Demo](https://via.placeholder.com/800x400?text=WritersPad+Demo)

## Features

-   **Rich Text Formatting**: Bold, Italic, Underline, Strike, Sub/Superscript.
-   **Typography**: Headings, Blockquotes, Lists (Bullet, Ordered, Task).
-   **Structure**: Indent/Outdent, Horizontal Rules, Text Alignment.
-   **Media**: 
    -   Images with resizing and float alignment.
    -   Smart Image Dialog (URL, Upload, Gallery).
-   **Theming**: Built-in Light and Dark modes.
-   **Developer Experience**:
    -   Sticky Toolbar.
    -   Markdown, HTML, and JSON support.
    -   Real-time Content Statistics (Words, Chars, Reading Time).
    -   TypeScript support.

## Installation

```bash
npm install writers-pad-core
```

## Usage

### 1. Basic Initialization

Create a container element and initialize the editor.

```html
<div id="editor-container"></div>
```

```javascript
import { WritersPad } from 'writers-pad-core';
import 'writers-pad-core/dist/style.css'; // Import styles

const editor = new WritersPad({
    element: document.getElementById('editor-container'),
    placeholder: 'Start your story...',
    defaultTheme: 'light', // or 'dark'
    content: '<p>Initial content...</p>'
});
```

### 2. Configuration Options

```javascript
const editor = new WritersPad({
    element: HTMLElement,       // Required: The container element
    
    // Content & Appearance
    content: string,            // Initial HTML or Markdown
    placeholder: string,        // Placeholder text
    defaultTheme: 'light',      // 'light' | 'dark'
    fonts: string[],           // Array of Google Fonts to load
    stickyToolbar: true,        // Keep toolbar visible on scroll

    // Events
    onUpdate: (html) => {
        // Triggered when content changes
        console.log('New content:', html);
    },
    
    onStatsUpdate: (stats) => {
        // Triggered when stats change
        console.log('Words:', stats.words);
        console.log('Reading Time:', stats.readingTimeMinutes);
    },

    // Image Handling (Optional)
    onImageUpload: async (file) => {
        // Upload file to your server and return the URL
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch('/api/upload', { body: formData, method: 'POST' });
        const data = await response.json();
        return data.url; 
    },

    onImageSelect: async () => {
        // Open your media gallery and return the selected URL
        // If user cancels, return null
        return 'https://example.com/selected-image.jpg';
    }
});
```

### 3. API Methods

You can interact with the editor instance programmatically.

```javascript
// Get Content
const html = editor.getHTML();
const json = editor.getJSON();
const markdown = editor.getMarkdown();

// Theming
editor.setTheme('dark'); // 'light' | 'dark'

// Cleanup
editor.destroy();
```

## License

MIT
