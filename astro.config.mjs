import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// https://docs.astro.build + https://keystatic.com/docs/installation-astro
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [react(), keystatic()],
});
