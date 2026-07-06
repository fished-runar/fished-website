import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// https://astro.build/config — SSR on Cloudflare Pages Workers
export default defineConfig({
  site: 'https://fished-website.pages.dev',
  output: 'server',
  adapter: cloudflare({ mode: 'directory' }),
  integrations: [tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: {
      noExternal: ['@tinacms/astro', '@tinacms/bridge'],
    },
  },
});
