// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Sitemap lastmod comes only from a blog post's `updatedDate` frontmatter,
// set by hand when a post is substantially rewritten. Other pages get none.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const blogUpdated = new Map();
for (const file of readdirSync(blogDir)) {
  const match = readFileSync(new URL(file, blogDir), 'utf8').match(/^updatedDate:\s*["']?([\d-]+)/m);
  if (match) blogUpdated.set(`https://blastingjack.com/blog/${file.replace(/\.mdx?$/, '')}/`, new Date(match[1]).toISOString());
}

export default defineConfig({
  site: 'https://blastingjack.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      serialize(item) {
        const lastmod = blogUpdated.get(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  redirects: {
    '/contact': '/#contact',
    '/sitemap.xml': '/sitemap-index.xml',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
