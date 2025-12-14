import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local.sqlite'
	}
});
