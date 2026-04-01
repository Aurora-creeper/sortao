/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        // root: 'test',
        clearMocks: true,
        typecheck: {
            enabled: true,
            tsconfig: "./tsconfig.json"
        },
        coverage: {
            include: [
                'src/splay/*.{js,ts}',
                'src/deque/*.{js,ts}',
                'src/randomized-heap/*.{js,ts}',

                'src/block-array/*.{js,ts}',
                'src/block-deque/*.{js,ts}',
                'src/block-list/*.{js,ts}',

                'src/sorted-block-array/*.{js,ts}',
                'src/sorted-block-deque/*.{js,ts}',
                'src/sorted-block-list/*.{js,ts}',

                'src/sorted-map/*.{js,ts}',
                'src/sorted-set/*.{js,ts}',
                'src/sorted-multimap/*.{js,ts}',
                'src/sorted-multiset/*.{js,ts}'
            ]
        }
    },
    build: {
        lib: {
            name: 'sortao',
            entry: "./src/index.ts",
            formats: ['es', 'cjs'],
        },
    },
});
