import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		}),
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components'
		},

		// Content Security Policy
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://js.stripe.com'],
				'style-src': ['self', 'unsafe-inline'], // Required for Tailwind
				'img-src': ['self', 'data:', 'https:'],
				'font-src': ['self'],
				'connect-src': ['self', 'https://api.stripe.com'],
				'frame-src': ['self', 'https://js.stripe.com', 'https://hooks.stripe.com'],
				'form-action': ['self'],
				'base-uri': ['self'],
				'frame-ancestors': ['none']
			}
		}
	}
};

export default config;
