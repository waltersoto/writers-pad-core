import { icons } from './icons';

export interface ImageModalOptions {
    onImageUpload?: (file: File) => Promise<string>;
    onImageSelect?: () => Promise<string>;
    onInsert: (url: string) => void;
    onClose: () => void;
    theme?: 'light' | 'dark';
}

export class ImageModal {
    private element: HTMLElement;
    private options: ImageModalOptions;

    constructor(options: ImageModalOptions) {
        this.options = options;
        this.element = document.createElement('div');
        this.element.className = 'wp-modal-overlay';
        if (options.theme === 'dark') {
            this.element.classList.add('dark-mode');
        }
        this.render();
        this.bindEvents();
        document.body.appendChild(this.element);

        // Focus input
        const input = this.element.querySelector('input') as HTMLInputElement;
        if (input) input.focus();
    }

    private render() {
        const showUpload = !!this.options.onImageUpload;
        const showGallery = !!this.options.onImageSelect;

        this.element.innerHTML = `
            <div class="wp-modal">
                <div class="wp-modal-header">
                    <h3>Insert Image</h3>
                    <button class="wp-close-btn">${icons.close || '×'}</button>
                </div>
                
                <div class="wp-modal-tabs">
                    <button class="wp-tab-btn active" data-tab="url">Link</button>
                    ${showUpload ? '<button class="wp-tab-btn" data-tab="upload">Upload</button>' : ''}
                    ${showGallery ? '<button class="wp-tab-btn" data-tab="gallery">Gallery</button>' : ''}
                </div>

                <div class="wp-modal-content">
                    <!-- URL Tab -->
                    <div class="wp-tab-pane active" id="pane-url">
                        <div class="wp-form-group">
                            <label>Image URL</label>
                            <input type="text" class="wp-input" placeholder="https://example.com/image.jpg">
                        </div>
                        <button class="wp-primary-btn" id="btn-insert-url">Insert Image</button>
                    </div>

                    <!-- Upload Tab -->
                    ${showUpload ? `
                    <div class="wp-tab-pane" id="pane-upload">
                        <div class="wp-drop-zone">
                            <div class="wp-drop-message">
                                <p>Drag & drop an image here, or click to select</p>
                                <input type="file" accept="image/*" hidden>
                            </div>
                        </div>
                        <div class="wp-upload-status"></div>
                    </div>` : ''}

                    <!-- Gallery Tab -->
                    ${showGallery ? `
                    <div class="wp-tab-pane" id="pane-gallery">
                        <p class="wp-hint-text">Browse your media library to select an image.</p>
                        <button class="wp-secondary-btn" id="btn-open-gallery">Open Media Library</button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    private bindEvents() {
        // Close
        this.element.querySelector('.wp-close-btn')?.addEventListener('click', () => this.close());
        this.element.addEventListener('mousedown', (e) => {
            if (e.target === this.element) this.close();
        });

        // Tabs
        const tabs = this.element.querySelectorAll('.wp-tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const tabId = target.dataset.tab;

                this.element.querySelectorAll('.wp-tab-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');

                this.element.querySelectorAll('.wp-tab-pane').forEach(p => p.classList.remove('active'));
                this.element.querySelector(`#pane-${tabId}`)?.classList.add('active');
            });
        });

        // URL Insert
        this.element.querySelector('#btn-insert-url')?.addEventListener('click', () => {
            const input = this.element.querySelector('#pane-url input') as HTMLInputElement;
            if (input.value) {
                this.options.onInsert(input.value);
                this.close();
            }
        });

        // Upload
        if (this.options.onImageUpload) {
            const dropZone = this.element.querySelector('.wp-drop-zone') as HTMLElement;
            const fileInput = dropZone.querySelector('input') as HTMLInputElement;

            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const file = e.dataTransfer?.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.handleUpload(file);
                }
            });

            fileInput.addEventListener('change', () => {
                if (fileInput.files && fileInput.files[0]) {
                    this.handleUpload(fileInput.files[0]);
                }
            });
        }

        // Gallery
        if (this.options.onImageSelect) {
            this.element.querySelector('#btn-open-gallery')?.addEventListener('click', async () => {
                try {
                    const url = await this.options.onImageSelect!();
                    if (url) {
                        this.options.onInsert(url);
                        this.close();
                    }
                } catch (error) {
                    console.error('Gallery selection failed:', error);
                }
            });
        }
    }

    private async handleUpload(file: File) {
        const status = this.element.querySelector('.wp-upload-status') as HTMLElement;
        status.textContent = 'Uploading...';

        try {
            const url = await this.options.onImageUpload!(file);
            this.options.onInsert(url);
            this.close();
        } catch (error) {
            status.textContent = 'Upload failed. Please try again.';
            console.error(error);
        }
    }

    private close() {
        this.element.remove();
        this.options.onClose();
    }
}
