import Image from '@tiptap/extension-image';


export const CustomImage = Image.extend({
    name: 'customImage',

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: (attributes) => {
                    return {
                        width: attributes.width,
                    };
                },
            },
            height: {
                default: 'auto',
                renderHTML: (attributes) => {
                    return {
                        height: attributes.height,
                    };
                },
            },
            float: {
                default: 'none',
                renderHTML: (attributes) => {
                    let style = '';
                    if (attributes.float === 'left') {
                        style = 'float: left; margin: 0 1rem 1rem 0;';
                    } else if (attributes.float === 'right') {
                        style = 'float: right; margin: 0 0 1rem 1rem;';
                    } else {
                        style = 'display: block; margin: 0 auto;';
                    }
                    return {
                        style,
                        'data-float': attributes.float,
                    };
                },
            },
        };
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const container = document.createElement('div');
            container.classList.add('image-resizer-wrapper');
            container.style.position = 'relative';
            container.style.display = 'inline-block';
            container.style.lineHeight = '0'; // Fix extra space

            // Apply initial float/alignment styles to the wrapper
            if (node.attrs.float === 'left') {
                container.style.float = 'left';
                container.style.margin = '0 1rem 1rem 0';
            } else if (node.attrs.float === 'right') {
                container.style.float = 'right';
                container.style.margin = '0 0 1rem 1rem';
            } else {
                container.style.display = 'block';
                container.style.margin = '0 auto';
                container.style.textAlign = 'center'; // Center the inner img if block
            }

            // The Image
            const img = document.createElement('img');
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || '';
            img.style.width = node.attrs.width || '100%';
            // Ensure constraints
            img.style.maxWidth = '100%';
            img.style.minWidth = '50px';

            // Click to select
            img.addEventListener('click', () => {
                // Just visual selection handled by CSS usually, but we might want explicit selection
            });

            container.appendChild(img);

            // --- Resize Handles ---
            const handles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            let isResizing = false;
            let startX = 0;
            let startWidth = 0;

            handles.forEach((pos) => {
                const handle = document.createElement('div');
                handle.classList.add('resize-handle', pos);

                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isResizing = true;
                    startX = e.clientX;
                    startWidth = img.clientWidth;

                    const onMouseMove = (e: MouseEvent) => {
                        if (!isResizing) return;
                        const diff = e.clientX - startX;
                        // Determine direction based on handle
                        const direction = pos.includes('left') ? -1 : 1;
                        let newWidth = startWidth + (diff * direction);

                        img.style.width = `${newWidth}px`;
                    };

                    const onMouseUp = () => {
                        isResizing = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);

                        if (typeof getPos === 'function') {
                            editor.commands.updateAttributes(CustomImage.name, {
                                width: img.style.width,
                            });
                        }
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });

                container.appendChild(handle);
            });

            // --- Alignment Tools (Hover/Focus) ---
            const tools = document.createElement('div');
            tools.classList.add('image-actions');

            const alignLeft = document.createElement('button');
            alignLeft.innerText = 'Left';
            alignLeft.type = 'button';
            alignLeft.onclick = () => {
                editor.commands.updateAttributes(CustomImage.name, { float: 'left' });
            };

            const alignCenter = document.createElement('button');
            alignCenter.innerText = 'Center';
            alignCenter.type = 'button';
            alignCenter.onclick = () => {
                editor.commands.updateAttributes(CustomImage.name, { float: 'none' });
            };

            const alignRight = document.createElement('button');
            alignRight.innerText = 'Right';
            alignRight.type = 'button';
            alignRight.onclick = () => {
                editor.commands.updateAttributes(CustomImage.name, { float: 'right' });
            };

            tools.appendChild(alignLeft);
            tools.appendChild(alignCenter);
            tools.appendChild(alignRight);
            container.appendChild(tools);

            // Update function to react to prop changes (though Tiptap mostly re-renders)
            // We rely on Tiptap re-rendering the whole NodeView if attributes change significantly

            return {
                dom: container,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== CustomImage.name) return false;

                    // Update Image props
                    img.src = updatedNode.attrs.src;
                    img.style.width = updatedNode.attrs.width;

                    // Update wrapper styles for Float
                    if (updatedNode.attrs.float === 'left') {
                        container.style.float = 'left';
                        container.style.margin = '0 1rem 1rem 0';
                        container.style.display = 'inline-block';
                        container.style.textAlign = 'left';
                    } else if (updatedNode.attrs.float === 'right') {
                        container.style.float = 'right';
                        container.style.margin = '0 0 1rem 1rem';
                        container.style.display = 'inline-block';
                        container.style.textAlign = 'right';
                    } else {
                        container.style.float = 'none';
                        container.style.display = 'block';
                        container.style.margin = '0 auto';
                        container.style.textAlign = 'center';
                    }

                    return true;
                },
            };
        };
    },
});
