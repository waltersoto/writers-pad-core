import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WritersPad',
      fileName: 'writers-pad-core',
    },
    rollupOptions: {
        // We want to bundle tiptap instructions so it's a standalone "Premium Component" drop-in.
        // But if the user wanted to share deps, we would verify here. For now, bundle everything.
    },
  },
});
