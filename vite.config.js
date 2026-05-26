import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'DateRangeSlider',
      fileName: (format) => `date-range-slider.${format}.js`,
    },
    rollupOptions: {
      external: ['nouislider'],
      output: {
        globals: {
          nouislider: 'noUiSlider',
        },
        assetFileNames: 'date-range-slider.[ext]',
      },
    },
    cssCodeSplit: false,
  },
});
