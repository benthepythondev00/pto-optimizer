import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	test: {
		// Unit tests for utility functions (Node environment)
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.e2e.{test,spec}.{js,ts}', 'tests/**/*'],
		environment: 'node',
	},
});
