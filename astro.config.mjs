import { defineConfig } from 'astro/config';

// https://astro.build/config — static build for Cloudflare Pages
export default defineConfig({
  site: 'https://fished-website.pages.dev',
  output: 'static',
});
